atrJsTest =
{
    width: 100,
    height: 50,
    count: 0,

    // test style template
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

    // 
    context: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML =
            "<div js>" +
                "<js-atr name='title' value='\"{{atrJsTest.increment()}}\"' select='parent'></js-atr>" +
                "<js-atr name='title' value='\"{{atrJsTest.increment()}}\"' select='parent'></js-atr>" +
                "<js-atr name='title' value='\"{{atrJsTest.increment()}}\"' select='parent'></js-atr>" +
            "</div>";

        cool.processElement(area);

        var div = area.querySelector("div");

        // raise action
        div._cool.action({initial : div._cool.hash});

        assert.ok(div.hasAttribute("title") == true, "has attribute");
        assert.ok(atrJsTest.count == 3, "check calling count");

        area.innerHTML = "";
        atrJsTest.count = 0;

        delete area._cool;
    },

    increment: function ()
    {
        return ++this.count;
    }
};


QUnit.module("attribute js");

QUnit.test("Style template", atrJsTest.style);
QUnit.test("Context", atrJsTest.context);