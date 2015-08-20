"use strict";

describe('QN Model', function() {

    var qnm;

    beforeEach(function() {
        qnm = new QNM('sample', 'id');
    });

    it("should be created with id and name", function () {
        expect(qnm).not.toBeUndefined();
        expect(qnm.id).toEqual('id');
        expect(qnm.name).toEqual('sample');
    });

    it("should be add new node", function () {
        qnm.addNode();
        expect(qnm.nodes.length).toEqual(1);
        expect(qnm.nodes[0].id).toEqual(1);
        expect(qnm.nodes[0].name.value).toEqual("Node 1");
    });

    it("should be add new class", function () {
        qnm.addClass();
        expect(qnm.classes.length).toEqual(1);
        expect(qnm.classes[0].id).toEqual(1);
        expect(qnm.classes[0].name.value).toEqual("Class 1");
    });

    it("should be add new visit", function () {
        qnm.addNode();
        qnm.addClass();
        expect(qnm.visits.length).toEqual(1);
        expect(qnm.visits[0].id).toEqual("1-1");
    });

    it("should be initialized", function () {
        qnm.addNode();
        qnm.addClass();
        qnm.init();
        var clazz = qnm.classes[0];
        expect(clazz.throughput.value).toBeUndefined();
        expect(clazz.thinkTime.value).toBeUndefined();
        expect(clazz.userNumber.value).toBeUndefined();
        expect(clazz.responseTime.value).toBeUndefined();

        var node = qnm.nodes[0];
        expect(node.nodeNumber.value).toEqual(1);
        expect(node.utilization.value).toBeUndefined();
        expect(node.meanNumberTasks.value).toBeUndefined();
        expect(node.totalMeanNumberTasks.value).toBeUndefined();

        var visit = qnm.visits[0];
        expect(visit.number.value).toBeUndefined();
        expect(visit.totalNumber.value).toEqual(1);
        expect(visit.serviceTime.value).toBeUndefined();
        expect(visit.serviceDemands.value).toBeUndefined();
        expect(visit.utilization.value).toEqual(0);
        expect(visit.residenceTime.value).toBeUndefined();
        expect(visit.throughput.value).toBeUndefined();

    });

});