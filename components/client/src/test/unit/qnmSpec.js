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
        expect(visit.utilization.value).toBeUndefined();
        expect(visit.residenceTime.value).toBeUndefined();
        expect(visit.throughput.value).toBeUndefined();
    });

    /*
     * Example: Use of Utilization Law
     *
     * A network segment transmits 1,000 packets/sec. Each
     * packet has an average transmission time equal to 0.15
     * msec. What is the utilization of LAN segment?
     */
    it("should be resolved by Utilization Law", function () {
        qnm.addNode();
        qnm.addClass();
        qnm.init();

        var visit = qnm.visits[0];

        visit.all["XI"].text = 1000;
        expect (qnm.calculate(new Parameter("XI", visit))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit.all["S"].text = 0.15;
        expect (qnm.calculate(new Parameter("S", visit))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        expect (visit.all["D"].text).toEqual(0.15);
        expect (visit.all["U"].text).toEqual(15);

    });

    /*
     * Example of Little Law
     *
     * An NFS server was monitored during 30 minutes and
     * the number of I/O operations performed during the
     * period was found to be 10,800. The average number of
     * active NFS requests was found to be three. What was
     * the average response time per NFS request at the server?
     */
    it("should be resolved by Little Law", function () {
        qnm.addNode();
        qnm.addClass();
        qnm.init();

        var visit = qnm.visits[0];
        var node = qnm.nodes[0];

        visit.all["XI"].text = 10800 / (30 * 60);
        expect (qnm.calculate(new Parameter("XI", visit))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        node.all["N"].text = 3;
        expect (qnm.calculate(new Parameter("N", node))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        expect (visit.all["RT"].text).toEqual(0.5);

    });

    /*
     Database transactions perform an average of 4.5 I/O
     operations on the database server. The database server
     was monitored during one hour and during this period,
     7,200 transactions were executed during this period.
     What is the average throughput of the disk? If each disk
     I/O takes 20 msec on average, what was the disk
     utilization?
     */
    it("should be resolved for few visits", function () {
        qnm.addNode();
        qnm.addClass();
        qnm.init();

        var visit = qnm.visits[0];
        var clazz = qnm.classes[0];

        visit.all["V"].text = 4.5;
        expect (qnm.calculate(new Parameter("V", visit))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        clazz.all["X"].setUnit(new QNMUnit('tph', 'tph', 1 / 3600));
        clazz.all["X"].text = 7200;
        expect (qnm.calculate(new Parameter("X", clazz))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit.all["S"].text = 20;
        expect (qnm.calculate(new Parameter("S", visit))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        expect (visit.all["XI"].text).toEqual(9);
        expect (visit.all["U"].text).toEqual(18);

    });

    /*
     * Example: Open QNM Solution
     System arrival rate, λ = 5 jobs per second
     Number of visits, V
     CPU 5
     Disk1 3
     Disk2 1
     Mean service time, S
     CPU 0.01
     Disk1 0.03
     Disk2 0.02
     */
    it("should be resolved with few nodes", function () {
        qnm.addNode();
        qnm.addNode();
        qnm.addNode();
        qnm.addClass();
        qnm.init();

        var clazz = qnm.classes[0];
        var cpu = qnm.nodes[0];
        var disk1 = qnm.nodes[1];
        var disk2 = qnm.nodes[2];

        var visit1 = qnm.visits[0];
        var visit2 = qnm.visits[1];
        var visit3 = qnm.visits[2];

        clazz.all["X"].text = 5;
        expect (qnm.calculate(new Parameter("X", clazz))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit1.all["V"].text = 5;
        expect (qnm.calculate(new Parameter("V", visit1))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit2.all["V"].text = 3;
        expect (qnm.calculate(new Parameter("V", visit2))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit3.all["V"].text = 1;
        expect (qnm.calculate(new Parameter("V", visit3))).toEqual(true);
        expect (qnm.valid()).toEqual(true);


        visit1.all["S"].text = 10;
        expect (qnm.calculate(new Parameter("S", visit1))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit2.all["S"].text = 30;
        expect (qnm.calculate(new Parameter("S", visit2))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        visit3.all["S"].text = 20;
        expect (qnm.calculate(new Parameter("S", visit3))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        expect (visit1.all["XI"].text).toEqual(25);
        expect (visit2.all["XI"].text).toEqual(15);
        expect (visit3.all["XI"].text).toEqual(5);

        expect (visit1.all["U"].text).toEqual(25);
        expect (visit2.all["U"].text).toEqual(45);
        expect (visit3.all["U"].text).toEqual(10);

        expect (visit1.all["RT"].text).toEqual(0.01333);
        expect (visit2.all["RT"].text).toEqual(0.05455);
        expect (visit3.all["RT"].text).toEqual(0.02222);

        expect (cpu.all["N"].text).toEqual(0.33333);
        expect (disk1.all["N"].text).toEqual(0.81818);
        expect (disk2.all["N"].text).toEqual(0.11111);

        expect (clazz.all["R"].text).toEqual(0.25252);

    });


    /*
     * Example: Open QNM Solution
     System arrival rate,
     λ (Read)= 5 jobs per second
     λ (Write)= 2 jobs per second
     */
    it("should be resolved for few classes", function () {
        qnm.addClass();
        qnm.addClass();

        qnm.addNode();
        qnm.addNode();
        qnm.addNode();
        qnm.init();

        var read = qnm.classes[0];
        var write = qnm.classes[1];

        var cpu = qnm.nodes[0];
        var disk1 = qnm.nodes[1];
        var disk2 = qnm.nodes[2];

        var read_cpu = qnm.getVisitBy(read, cpu);
        var read_disk1 = qnm.getVisitBy(read, disk1);
        var read_disk2 = qnm.getVisitBy(read, disk2);

        var write_cpu = qnm.getVisitBy(write, cpu);
        var write_disk1 = qnm.getVisitBy(write, disk1);
        var write_disk2 = qnm.getVisitBy(write, disk2);


        read.all["X"].text = 5;
        expect (qnm.calculate(new Parameter("X", read))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        write.all["X"].text = 2;
        expect (qnm.calculate(new Parameter("X", write))).toEqual(true);
        expect (qnm.valid()).toEqual(true);


        read_cpu.all["S"].text = 100;
        expect (qnm.calculate(new Parameter("S", read_cpu))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        read_disk1.all["S"].text = 80;
        expect (qnm.calculate(new Parameter("S", read_disk1))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        read_disk2.all["S"].text = 70;
        expect (qnm.calculate(new Parameter("S", read_disk2))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        write_cpu.all["S"].text = 150;
        expect (qnm.calculate(new Parameter("S", write_cpu))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        write_disk1.all["S"].text = 200;
        expect (qnm.calculate(new Parameter("S", write_disk1))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        write_disk2.all["S"].text = 100;
        expect (qnm.calculate(new Parameter("S", write_disk2))).toEqual(true);
        expect (qnm.valid()).toEqual(true);

        expect (read_cpu.all["U"].text).toEqual(50);
        expect (read_disk1.all["U"].text).toEqual(40);
        expect (read_disk2.all["U"].text).toEqual(35);
        expect (write_cpu.all["U"].text).toEqual(30);
        expect (write_disk1.all["U"].text).toEqual(40);
        expect (write_disk2.all["U"].text).toEqual(20);

        expect (read_cpu.all["RT"].text).toEqual(0.5);
        expect (read_disk1.all["RT"].text).toEqual(0.4);
        expect (read_disk2.all["RT"].text).toEqual(0.15556);
        expect (write_cpu.all["RT"].text).toEqual(0.75);
        expect (write_disk1.all["RT"].text).toEqual(1);
        expect (write_disk2.all["RT"].text).toEqual(0.22222);

        expect (read.all["R"].text).toEqual(1.0556);
        expect (write.all["R"].text).toEqual(1.9722);

    });

});