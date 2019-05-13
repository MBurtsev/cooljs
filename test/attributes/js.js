atrJsTest =
{
    width: 100,
    height: 50,
    count: 0,
    path: "",
    ext: "",

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

    // test dynamic set attribute template
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

    // test observation
    observe: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML =
            "<div title='{{atrJsTest.count}}' js>" +
                "<js-set name='atrJsTest.count' value='5' type='int'></js-set>" +
            "</div>";

        cool.processElement(area);

        var div = area.querySelector("div");

        var context = { initial: div._cool.hash };

        // raise action
        div._cool.action(context);

        assert.ok(div.getAttribute("title") == "5", "check attribute");
        assert.ok(atrJsTest.count == 5, "check count");

        area.innerHTML = "";
        atrJsTest.count = 0;

        delete area._cool;
    },

    // cool tags with templating
    tagsTemplating: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML =
            "<div>" +
                "<js-set name='atrJsTest.path' value='main/' type='string'></js-set>" +
                "<js-set name='atrJsTest.ext' value='css' type='string'></js-set>" +
                "<js-load src='{{atrJsTest.path}}html/test.html' type='{{atrJsTest.ext}}'></js-load>" +
            "</div>";

        cool.processElement(area);

        var tag = area.querySelector("js-load");

        var context = { initial: document.documentElement._cool.hash };

        // raise action
        document.documentElement._cool.action(context);

        assert.ok(tag.getAttribute("src") == "main/html/test.html", "check attribute");

        area.innerHTML = "";
        atrJsTest.path = "";

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
QUnit.test("Observe", atrJsTest.observe);
QUnit.test("Templating", atrJsTest.tagsTemplating);