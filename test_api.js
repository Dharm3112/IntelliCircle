const axios = require('axios');

(async () => {
    try {
        const auth = await axios.post('http://192.168.29.249:8081/api/auth/anonymous', { username: 'diag_bot_1' });
        const token = auth.data.data.accessToken;

        try {
            const res = await axios.get('http://192.168.29.249:8081/api/rooms/nearby?lat=40.7128&lng=-74.0060&radiusKm=50', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Success:", res.data);
        } catch (roomErr) {
            console.error("Endpoint Error:", JSON.stringify(roomErr.response?.data, null, 2));
        }

        try {
            const globalRes = await axios.get('http://192.168.29.249:8081/api/rooms/global', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Global Success");
        } catch (gErr) {
            console.error("Global Error:", JSON.stringify(gErr.response?.data, null, 2));
        }

    } catch (err) {
        console.error("Auth Error:", err?.response?.data || err?.message);
    }
})();
