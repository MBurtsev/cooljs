var jsQueryTest =
{
    onlyFrom: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        jsQueryTest.checkFrom(obj, assert);

        // raise action
        obj._cool.action();

        jsQueryTest.checkData(jsQueryTest.createTestData(10), obj._cool.data, assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndWhereOnlyFirst: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where user.code == 0'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        jsQueryTest.checkFrom(obj, assert);
        jsQueryTest.checkWhere(obj, assert);

        // raise action
        obj._cool.action();

        var tdata = jsQueryTest.createTestData(10).slice(0, 1);

        jsQueryTest.checkData(tdata, obj._cool.data, assert);
        
        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndWhereOnlyLast: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where user.code == 9'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        jsQueryTest.checkFrom(obj, assert);
        jsQueryTest.checkWhere(obj, assert);

        // raise action
        obj._cool.action();

        var tdata = jsQueryTest.createTestData(10).slice(9);

        jsQueryTest.checkData(tdata, obj._cool.data, assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    // check From operator
    checkFrom: function (obj, assert)
    {
        initTest.check(obj, assert);

        if (obj == null)
        {
            assert.ok(false, "Getting element fail");

            return;
        }

        // check query init
        assert.ok(obj._cool.refresh != null, "Observe function defined");
        assert.ok(obj._cool.prog != null, "Query program defined");
        assert.ok(obj._cool.prog.from != null, "From operator defined");

        // main field
        fieldTest.check(obj._cool.prog.from.field, assert);

        // root var
        assert.ok(obj._cool.prog.root == "user", "Root var fine");        
    },

    // check Where operator
    checkWhere: function (obj, assert)
    {
        // check query init
        assert.ok(obj._cool.prog.where != null, "From operator defined");

        // where conditional field
        fieldTest.check(obj._cool.prog.where.condField != null, assert);

        // root var
        assert.ok(typeof document[obj._cool.prog.where.condFuncName] == "function", "Function for where conditional created.");
    },

    // creating mock data
    createTestData : function(count)
    {
        var arr = [];

        for (var i = 0; i < count; ++i)
        {
            arr.push({ code: i, name: "name-" + i });
        }

        return arr;
    },

    // check result data with source
    checkData: function (src, dst, assert)
    {
        var flag = src.length == dst.length;

        assert.ok(flag, "Data len fine");

        if (flag)
        {
         f: for (var i = 0; i < src.length; ++i)
            {
                var itm0 = src[i];
                var itm1 = dst[i];

                if (typeof itm0 == "object")
                {
                    for (var p in itm0)
                    {
                        if (itm0.hasOwnProperty(p))
                        {
                            flag = itm1[p] != null;

                            if (!flag)
                            {
                                assert.ok(flag, "[" + i + "] " + "Destination data object dosn't have property: " + p);

                                break f;
                            }

                            flag = itm0[p] == itm1[p];

                            if (!flag)
                            {
                                assert.ok(flag, "[" + i + "] " + "Property " + p + " has value: " + itm1[p] + ", but must be: " + itm0[p]);

                                break f;
                            }
                        }
                    }
                }
                else
                {
                    flag = itm0 != itm1;

                    if (!flag)
                    {
                        assert.ok(flag, "[" + i + "]" + " Data has value: " + itm1 + ", but must be: " + itm0);

                        break;
                    }
                }
            }
        }

        return flag;
    }
};

QUnit.module("js-query");

QUnit.test("Only From", jsQueryTest.onlyFrom);
QUnit.test("Where code == first", jsQueryTest.fromAndWhereOnlyFirst);
QUnit.test("Where code == last", jsQueryTest.fromAndWhereOnlyLast);

