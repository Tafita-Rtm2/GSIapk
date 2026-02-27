from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        try:
            page.goto("http://localhost:3000/apk/login/", wait_until="networkidle")
            page.screenshot(path="/home/jules/verification/desktop_v12.png")

            # Mobile
            mobile_page = browser.new_page(viewport={'width': 375, 'height': 667}, is_mobile=True)
            mobile_page.goto("http://localhost:3000/apk/login/", wait_until="networkidle")
            mobile_page.screenshot(path="/home/jules/verification/mobile_v12.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    import os
    if not os.path.exists("/home/jules/verification"):
        os.makedirs("/home/jules/verification")
    verify()
