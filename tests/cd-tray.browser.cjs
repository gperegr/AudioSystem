const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const equipmentPage = require('./helpers/equipment-page.cjs');

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox'],
    });
    try {
        const {page, errors} = await equipmentPage(browser);
        await page.emulateMedia({reducedMotion: 'reduce'});
        await page.evaluate(() => {
            __equipment.createDevice('cdPlayer', 1000, 700, 'cd-fit');
            __equipment.selectDevice(null);
        });
        await page.locator('#fit-selection').click();
        const player = page.locator('#cd-fit');
        const tray = player.locator('.cd-tray');
        assert.equal(await player.getAttribute('data-model'), 'NX-D30');

        const assertOpen = async () => {
            assert.equal(await tray.getAttribute('aria-expanded'), 'true');
            const result = await tray.evaluate(el => {
                const tray = el.getBoundingClientRect();
                const platform = el.querySelector('.cd-tray-platform').getBoundingClientRect();
                const disc = el.querySelector('.cd-tray-disc').getBoundingClientRect();
                const lip = el.querySelector('.cd-tray-lip').getBoundingClientRect();
                return {
                    ratio: disc.width / tray.width,
                    centered: Math.abs(disc.left + disc.right - platform.left - platform.right) < 1,
                    clear: disc.height > 0 && platform.top < disc.top && disc.bottom < lip.top,
                };
            });
            assert(result.ratio > .70 && result.ratio < .80, JSON.stringify(result));
            assert(result.centered && result.clear, JSON.stringify(result));
        };

        await tray.click();
        await assertOpen();
        await tray.click();
        assert.equal(await tray.getAttribute('aria-expanded'), 'false');

        const anchor = await tray.boundingBox();
        await page.mouse.move(anchor.x + anchor.width / 2, anchor.y + anchor.height / 2);
        for (let step = 0; step < 4; step++) await page.mouse.wheel(0, -160);
        await page.waitForFunction(() => document.getElementById('zoom-label').textContent === '250%');

        await page.emulateMedia({reducedMotion: 'no-preference'});
        await tray.focus();
        await page.keyboard.press('Enter');
        const waitForTray = () => tray.evaluate(el => Promise.all(el.getAnimations({subtree: true}).map(animation => animation.finished)));
        await waitForTray();
        await assertOpen();
        if (process.env.CD_TRAY_SCREENSHOT) {
            const box = await tray.boundingBox();
            await page.screenshot({path: process.env.CD_TRAY_SCREENSHOT, clip: {
                x: box.x - 14, y: box.y - 28, width: box.width + 28, height: box.height + 114,
            }});
        }
        await page.keyboard.press('Enter');
        await waitForTray();
        assert.equal(await tray.getAttribute('aria-expanded'), 'false');
        assert.equal(await tray.locator('.cd-tray-platform').evaluate(el => el.getBoundingClientRect().height), 0);
        assert.deepEqual(errors, []);
        console.log('NX-D30 disc fits the tray at fit-to-view and 250% zoom with mouse and keyboard.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
