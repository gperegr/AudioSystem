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
            // Supply a silent audio track and let each test settle the permission request.
            navigator.mediaDevices.getUserMedia = () => new Promise((resolve, reject) => {
                window.capturePermission = {
                    grant: () => resolve(__equipment.appState.audio.context.createMediaStreamDestination().stream),
                    deny: () => reject(new DOMException('Test denied capture', 'NotAllowedError')),
                };
            });
        });

        for (const model of [1, 2, 3, 4]) {
            const id = `usb-capture-${model}`;
            await page.evaluate(({model, id}) => __equipment.createDevice(`audioInterface${model}`, 600, 280, id), {model, id});
            const button = page.locator(`#${id} [data-source-play]`);
            const readIndicator = () => button.evaluate(el => {
                const ring = getComputedStyle(el, '::after');
                return {pressed: el.getAttribute('aria-pressed'), opacity: ring.opacity, pointerEvents: ring.pointerEvents};
            });
            const idle = {pressed: 'false', opacity: '0', pointerEvents: 'none'};
            const active = {...idle, pressed: 'true', opacity: '1'};

            assert.deepEqual(await readIndicator(), idle, `U-${model}0 starts unlit`);
            await button.evaluate(el => el.click());
            assert.deepEqual(await readIndicator(), idle, `U-${model}0 stays unlit while awaiting permission`);
            if (model === 1) {
                await page.evaluate(() => capturePermission.deny());
                await page.waitForFunction(id => !__equipment.appState.project.devices[id].capturePending, id);
                assert.deepEqual(await readIndicator(), idle, 'Denied capture stays unlit');
                await button.evaluate(el => el.click());
            }
            await page.evaluate(() => capturePermission.grant());
            await page.waitForFunction(id => __equipment.appState.project.devices[id].state.playing, id);
            assert.deepEqual(await readIndicator(), active, `U-${model}0 lights up during silent capture`);

            if (model === 4) {
                await page.evaluate(id => {
                    const track = __equipment.appState.project.devices[id].micStream.getAudioTracks()[0];
                    track.stop();
                    track.dispatchEvent(new Event('ended'));
                }, id);
            } else {
                await button.evaluate(el => el.click());
            }
            assert.deepEqual(await readIndicator(), idle, `U-${model}0 turns off when capture ends`);
        }

        assert.deepEqual(errors, []);
        console.log('USB capture indicators passed for all four models.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
