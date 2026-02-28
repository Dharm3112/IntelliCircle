import { FastifyInstance } from "fastify";
import { db } from "../db/index";
import { waitlist } from "@intellicircle/shared";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "../utils/response";

// Validation Schema
const joinWaitlistSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2).max(100),
    profession: z.string().min(2).max(100),
    location: z.string().min(2).max(100),
    interests: z.array(z.string()).min(1).max(5),
});

export async function waitlistRoutes(app: FastifyInstance) {
    // Aggressive Rate Limit: Max 3 waitlist attempts per IP rolling per hour
    app.post("/", {
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 hour'
            }
        }
    }, async (request, reply) => {
        const payload = joinWaitlistSchema.safeParse(request.body);
        if (!payload.success) {
            return reply.status(400).send(createErrorResponse("Invalid payload", "VALIDATION_ERROR", payload.error.format()));
        }

        const { email, fullName, profession, location, interests } = payload.data;

        try {
            // Write to Postgres
            const [entry] = await db.insert(waitlist).values({
                email,
                fullName,
                profession,
                location,
                interests,
            }).returning();

            // Mocking Transactional Email Dispatcher 
            // In Production, this would execute: await resend.emails.send({ to: email, ... })
            app.log.info(`[TRANSACTIONAL EMAIL DISPATCHED] -> Sent "You're on the list!" confirmation to: ${email}`);

            return reply.status(201).send(createSuccessResponse({
                message: "Successfully joined waitlist",
                id: entry.id,
            }));

        } catch (error: any) {
            // Handle Postgres Unique Constraint Violation (Code 23505)
            if (error.code === '23505' && error.constraint === 'waitlist_email_unique') {
                return reply.status(409).send(createErrorResponse("This email is already on the waitlist.", "DUPLICATE_EMAIL"));
            }

            app.log.error(error);
            return reply.status(500).send(createErrorResponse("Failed to join waitlist due to internal server error."));
        }
    });
}
