const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=readFileSync(path.join(__dirname,'../script.js'),'utf8');

test('power-on gauge calibration sweeps to full scale and returns to its rest angle',()=>{
    const start=source.indexOf('        function deviceGaugeCalibrationAngle('),end=source.indexOf('        function stopPowerOnRitual(',start);
    assert.ok(start>=0&&end>start,'gauge calibration helper must exist');
    const context=vm.createContext({});
    vm.runInContext(source.slice(start,end)+'\nthis.deviceGaugeCalibrationAngle=deviceGaugeCalibrationAngle;',context);
    const device={gaugeCalibration:{startedAt:1000,duration:1250}};
    const angle=(time)=>context.deviceGaugeCalibrationAngle(device,time,-48,46);
    assert.equal(angle(1000),-48);
    assert.ok(angle(1225)>-48&&angle(1225)<46);
    assert.equal(angle(1450),46);
    assert.equal(angle(1500),46);
    assert.ok(angle(1900)>-48&&angle(1900)<46);
    assert.equal(angle(2250),null);
    assert.equal(device.gaugeCalibration,null);
});

test('precision preamp output needles follow stereo output meters and power-on calibration',()=>{
    const start=source.indexOf('        function updateReferenceHardware(now){'),end=source.indexOf('        function integratedGauge(',start);
    const update=source.slice(start,end);
    assert.match(update,/dev\.meters\?\.levels\[i\]/);
    assert.match(update,/deviceGaugeCalibrationAngle\(dev,now,-55,55\)/);
    const styles=readFileSync(path.join(__dirname,'../style.css'),'utf8');
    assert.match(styles,/device-type-prePrecision\.power-off \.precision-meter \{filter:brightness\(\.4\)/);
    assert.match(styles,/device-type-prePrecision:not\(\.power-off\) \.precision-meter \{box-shadow:0 0 8px/);
});
