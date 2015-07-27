var fieldTest =
{
    testInt : 5,

    intAbs: function (assert)
    {
        var fld = cool.createField("fieldTest.testInt");

        fieldTest.check(fld, assert);

        fld.set(10);

        assert.ok(fieldTest.testInt == 10, "Set with absolute path complete");

        var tmp = fld.get();

        assert.ok(tmp == 10, "Get with absolute path complate");
    },

    intRel: function (assert)
    {
        var fld = cool.createField("testInt");

        fieldTest.check(fld, assert);

        fld.set(20, fieldTest);

        assert.ok(fieldTest.testInt == 20, "Set with relative path complete");

        var tmp = fld.get(fieldTest);

        assert.ok(tmp == 20, "Get with relative path complate");
    },

    cond: function (assert)
    {
        var fld = cool.createField("fieldTest.testInt == 5");

        var bp = 0;
    },

    check: function (fld, assert)
    {
        assert.ok(fld != null, "Field defined");
    }
};

QUnit.module("field");

QUnit.test("Absolute path", fieldTest.intAbs);
QUnit.test("Relative path", fieldTest.intRel);
//QUnit.test("Conditional", fieldTest.cond);