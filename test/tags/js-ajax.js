var jsQueryTest2222 =
{
    // check DOM elements generations
    toShort: function (obj, data, map, assert)
    {
        var arr = obj.querySelectorAll("div");
        var ind = 0;

        for (var i = 0; i < data.length; ++i)
        {
            for (var j = 0; j < map.length; ++j)
            {
                var v1;

                eval("v1 = data[i]." + map[j]);

                if (arr[ind].innerHTML != v1.toString())
                {
                    assert.ok(false, "Template fill fail. div has value of " + map[j] + ": " + arr[ind].innerHTML + ", must be: " + v1);

                    return;
                }

                ind++;
            }
        }

        assert.ok(true, "Template fill done.");
    }
};

QUnit.module("js-query");

QUnit.test("Only From", jsQueryTest.onlyFrom);