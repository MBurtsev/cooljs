atrJsTest =
{
    width: 100,
    height: 50,

    style: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<div to-style='background-color:green; width:{{atrJsTest.width}}px; height:{{atrJsTest.height}}px;' js>text</div>";

        cool.processElement(area);

        var div = area.querySelector("div");

        // raise action
        div._cool.action({initial : 0});

        assert.ok(area.childNodes.length == 1, "Chield count");
        assert.ok(div.style.width == "100px", "width");
        assert.ok(div.style.height == "50px", "height");

        area.innerHTML = "";

        delete area._cool;
    },
};


QUnit.module("attribute js");

QUnit.test("Style template", atrJsTest.style);