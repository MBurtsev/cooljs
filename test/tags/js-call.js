var jsCallTest =
{
    basic : function()
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user > user.code '>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(tdata.length == obj._cool.data.length, "Data len fine");
    }
};


QUnit.module("js-call");

QUnit.test("Basic", jsQueryTest.basic);