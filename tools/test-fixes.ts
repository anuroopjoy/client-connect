import { TestBed } from '@angular/core/testing';

const resetTestingModule = TestBed.resetTestingModule;
const preventAngularFromResetting = () => TestBed.resetTestingModule = () => TestBed;
const allowAngularToReset = () => {
    resetTestingModule();
    TestBed.resetTestingModule = resetTestingModule;
};

export function preTestSetup() {
    resetTestingModule();
    preventAngularFromResetting();
}

export function postTestCleanup() {
    allowAngularToReset();
}
