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
