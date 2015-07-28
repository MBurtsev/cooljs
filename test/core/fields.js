var fieldTest =
{
    testInt: 5,
    indexA: 1,
    indexB: 2,
    arr: [{ code: 1 }, { code: 2 }, { code: 3 }],
    test: { name: "123" },

    intAbs: function(assert)
    {
        var fld = cool.createField("fieldTest.testInt");

        fieldTest.check(fld, assert);

        fld.set(10);

        assert.ok(fieldTest.testInt == 10, "Set with absolute path complete");

        var tmp = fld.get();

        assert.ok(tmp == 10, "Get with absolute path complate");
    },

    intRel: function(assert)
    {
        var fld = cool.createField("testInt");

        fieldTest.check(fld, assert);

        fld.set(20, fieldTest);

        assert.ok(fieldTest.testInt == 20, "Set with relative path complete");

        var tmp = fld.get(fieldTest);

        assert.ok(tmp == 20, "Get with relative path complate");
    },

    arrayIntIndex: function(assert)
    {
        var fld = cool.createField("fieldTest.arr[1].code");

        fieldTest.check(fld, assert);

        fld.set(10);

        assert.ok(fieldTest.arr[1].code == 10, "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == 10, "Get complate");
    },

    arrayVarIndex: function(assert)
    {
        var fld = cool.createField("fieldTest.arr[fieldTest.indexA].code");

        fieldTest.check(fld, assert);

        fld.set(20);

        assert.ok(fieldTest.arr[fieldTest.indexA].code == 20, "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == 20, "Get complate");
    },

    arrayExpressionIndex: function(assert)
    {
        var fld = cool.createField("fieldTest.arr[fieldTest.indexA - 1].code");

        fieldTest.check(fld, assert);

        fld.set(30);

        assert.ok(fieldTest.arr[fieldTest.indexA - 1].code == 30, "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == 30, "Get complate");
    },

    arrayTwoVarsIndex: function(assert)
    {
        var fld = cool.createField("fieldTest.arr[fieldTest.indexB - fieldTest.indexA].code");

        fieldTest.check(fld, assert);

        fld.set(40);

        assert.ok(fieldTest.arr[fieldTest.indexB - fieldTest.indexA].code == 40, "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == 40, "Get complate");
    },

    funcRetObject: function (assert)
    {
        var fld = cool.createField("fieldTest.getTestObj().name");

        fieldTest.check(fld, assert);

        fld.set("Bill");

        assert.ok(fieldTest.test.name == "Bill", "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == "Bill", "Get complate");
    },

    funcRetParsObject: function (assert)
    {
        var fld = cool.createField("fieldTest.getTestArrayByIndex(2).code");

        fieldTest.check(fld, assert);

        fld.set(70);

        assert.ok(fieldTest.arr[2].code == 70, "Set complete");

        var tmp = fld.get();

        assert.ok(tmp == 70, "Get complate");
    },

    check: function(fld, assert)
    {
        assert.ok(fld != null, "Field defined");
    },

    getTestObj: function()
    {
        return fieldTest.test;
    },

    getTestArrayByIndex: function(ind)
    {
        return fieldTest.arr[ind];
    }

};

QUnit.module("field");

QUnit.test("Absolute path", fieldTest.intAbs);
QUnit.test("Relative path", fieldTest.intRel);
QUnit.test("Array with int index", fieldTest.arrayIntIndex);
QUnit.test("Array with var index", fieldTest.arrayVarIndex);
QUnit.test("Array with expression index", fieldTest.arrayExpressionIndex);
QUnit.test("Array with two vars index", fieldTest.arrayTwoVarsIndex);
QUnit.test("Function call and get obj by ref", fieldTest.funcRetObject);
QUnit.test("Function call with params and get obj by ref", fieldTest.funcRetParsObject);
