/**
 * This tiny script adds a development preview banner to *.replit.dev pages
 * Only displays the banner on replit dev domains when not embedded in an iframe
 * It's injected via @replit/vite-plugin-dev-banner only when the app is running in the development environment.
 */

/* eslint-disable no-undef, @replit/web/no-storage */
(function () {
  // Check if we're in an iframe
  if (window.self !== window.top) {
    return;
  }

  // Check if we're on a replit.dev preview domain
  const hostname = window.location.hostname;
  if (!hostname.endsWith('.replit.dev') && !hostname.endsWith('.repl.co')) {
    return;
  }

  // Check if the banner was previously closed
  const bannerClosedKey = 'replitDevBannerClosed-' + hostname;
  if (localStorage.getItem(bannerClosedKey) === 'true') {
    return;
  }

  // Create the banner container
  const bannerContainer = document.createElement('div');
  bannerContainer.id = 'replit-dev-banner';

  // Create the banner content
  bannerContainer.innerHTML = `
    <div class="banner-text">
      This is a temporary development preview, and these links are not for public use. <a href="https://docs.replit.com/category/replit-deployments?ref=replit-dev-banner" target="_blank" class="banner-link">Publish your app</a> for secure sharing or use an invite link.
    </div>
    <button class="banner-close" aria-label="Close banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z" />
      </svg>
    </button>
  `;

  // Inject styles
  const styles = document.createElement('style');
  styles.textContent = `
    #replit-dev-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background-color: #004182;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: opacity 0.2s ease-in-out;
    }
    
    .banner-text {
      flex-grow: 1;
    }
    
    .banner-link {
      color: white;
      font-weight: 500;
      text-decoration: underline;
    }
    
    .banner-link:hover {
      text-decoration: none;
    }
    
    .banner-close {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: rgba(255, 255, 255, 0.7);
      margin-left: 12px;
      transition: transform 0.1s ease-in-out, color 0.1s ease-in-out;
    }
    
    .banner-close:hover {
      transform: scale(1.05);
      color: white;
    }
    
    @media (max-width: 600px) {
      #replit-dev-banner {
        padding: 8px;
        font-size: 12px;
      }
      
      .banner-close {
        width: 24px;
        height: 24px;
        margin-left: 8px;
      }
    }
  `;

  // Append the banner and styles to the document
  document.head.appendChild(styles);

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appendBanner);
  } else {
    appendBanner();
  }

  function appendBanner() {
    document.body.appendChild(bannerContainer);

    // Add event listener for the close button
    const closeButton = bannerContainer.querySelector('.banner-close');
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        // Save the closed state to localStorage
        localStorage.setItem(bannerClosedKey, 'true');

        bannerContainer.style.opacity = '0';

        // Wait for transition to complete before hiding
        setTimeout(() => {
          bannerContainer.style.display = 'none';

          // Remove the padding from body when banner is hidden
          document.body.style.paddingTop = '0';
        }, 200);
      });
    }

    // Add padding to the body to prevent the banner from overlapping content
    const bannerHeight = bannerContainer.offsetHeight;
    if (bannerHeight > 0) {
      document.body.style.paddingTop = bannerHeight + 'px';

      // Update padding if window is resized
      const resizeListener = function () {
        const newHeight = bannerContainer.offsetHeight;
        if (newHeight > 0 && bannerContainer.style.display !== 'none') {
          document.body.style.paddingTop = newHeight + 'px';
        }
      };

      window.addEventListener('resize', resizeListener);

      // Clean up the event listener when the banner is closed
      closeButton.addEventListener('click', function () {
        window.removeEventListener('resize', resizeListener);
      });
    }
  }
})();
