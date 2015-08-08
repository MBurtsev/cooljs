var jsMetaStream =
{
    parseVarInt: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-var name="status" type="int"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:v:status-i", "toShort done");

        var tmp = cool.metaStream.parse(str, "1");
        var model = { status: 1 };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseVarFloat: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-var name="status" type="float"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:v:status-f", "toShort done");

        var tmp = cool.metaStream.parse(str, "1.5");
        var model = { status: 1.5 };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");


        area.innerHTML = "";
    },

    parseVarBool: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-var name="status" type="bool"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:v:status-b", "toShort done");

        var tmp = cool.metaStream.parse(str, "true");
        var model = { status: true };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseVarString: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-var name="status" type="string"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:v:status", "toShort done");

        var tmp = cool.metaStream.parse(str, "Bill");
        var model = { status: "Bill" };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseVarObject: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-var name="user" type="object">' +
                            '       <js-stream-var name="code" type="int"></js-stream-var>' +
                            '       <js-stream-var name="name" type="string"></js-stream-var>' +
                            '   </js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:o:user:v:code-i:v:name:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "3▲Mike");
        var model = { user : { code: 3, name: "Mike" }};

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    // TODO make more conditional
    parseIf: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-if name="status" value="1">' +
                            '       <js-stream-var name="status" type="int"></js-stream-var>' +
                            '   </js-stream-if>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:i:status:1:v:status-i:e", "toShort done");

        area.innerHTML = "";
    },


    parseForInt: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-for name="users" type="int"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:f:users:v:-i:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "6▲1▲2▲3▲4▲5▲6");
        var model = { users: [1, 2, 3, 4, 5, 6] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseForFloat: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-for name="users" type="float"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:f:users:v:-f:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "6▲1.3▲2.3▲3.3▲4.3▲5.3▲6.3");
        var model = { users: [1.3, 2.3, 3.3, 4.3, 5.3, 6.3] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseForBool: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-for name="users" type="bool"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:f:users:v:-b:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "6▲true▲false▲true▲false▲true▲false");
        var model = { users: [true, false, true, false, true, false] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseForString: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-for name="users" type="string"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:f:users:v::e", "toShort done");

        var tmp = cool.metaStream.parse(str, "6▲A▲B▲C▲D▲E▲F");
        var model = { users: ["A", "B", "C", "D", "E", "F"] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseForObject: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML = '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-for name="users" type="object">' +
                            '       <js-stream-var name="code" type="int"></js-stream-var>' +
                            '       <js-stream-var name="name" type="string"></js-stream-var>' +
                            '   </js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:f:users:v:code-i:v:name:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "2▲1▲A▲2▲B");
        var model = { users: [{ code: 1, name: "A" }, { code: 2, name: "B" }] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },


    parseWhileInt: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-while name="users" type="int" sign="!"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:w:users:!:v:-i:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "!▲1▲!▲2▲!▲3▲!▲4▲!▲5▲!▲6");
        var model = { users: [1, 2, 3, 4, 5, 6] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseWhileFloat: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-while name="users" type="float" sign="!"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:w:users:!:v:-f:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "!▲1.3▲!▲2.3▲!▲3.3▲!▲4.3▲!▲5.3▲!▲6.3");
        var model = { users: [1.3, 2.3, 3.3, 4.3, 5.3, 6.3] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseWhileBool: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-while name="users" type="bool" sign="!"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:w:users:!:v:-b:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "!▲true▲!▲false▲!▲true▲!▲false▲!▲true▲!▲false");
        var model = { users: [true, false, true, false, true, false] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseWhileString: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-while name="users" type="string" sign="!"></js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:w:users:!:v::e", "toShort done");

        var tmp = cool.metaStream.parse(str, "!▲A▲!▲B▲!▲C▲!▲D▲!▲E▲!▲F");
        var model = { users: ["A", "B", "C", "D", "E", "F"] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");

        area.innerHTML = "";
    },

    parseWhileObject: function (assert)
    {
        var area = document.querySelector("#testArea");

        area.innerHTML =    '<js-ajax-stream spliter="▲" declare>' +
                            '   <js-stream-while name="users" type="object" sign="!">' +
                            '       <js-stream-var name="code" type="int"></js-stream-var>' +
                            '       <js-stream-var name="name" type="string"></js-stream-var>' +
                            '   </js-stream-var>' +
                            '</js-ajax-stream>';

        var str = cool.metaStream.toShort(area.childNodes[0]);

        assert.ok(str == "▲:w:users:!:v:code-i:v:name:e", "toShort done");

        var tmp = cool.metaStream.parse(str, "!▲1▲A▲!▲2▲B");
        var model = { users: [{ code: 1, name: "A" }, { code: 2, name: "B" }] };

        assert.ok(h.compareObjects(model, tmp, assert), "data fine");


        area.innerHTML = "";
    },

};

QUnit.module("metaStream");

QUnit.test("parse var int", jsMetaStream.parseVarInt);
QUnit.test("parse var float", jsMetaStream.parseVarFloat);
QUnit.test("parse var bool", jsMetaStream.parseVarBool);
QUnit.test("parse var string", jsMetaStream.parseVarString);
QUnit.test("parse var object", jsMetaStream.parseVarObject);

QUnit.test("parse if", jsMetaStream.parseIf);

QUnit.test("parse for int", jsMetaStream.parseForInt);
QUnit.test("parse for float", jsMetaStream.parseForFloat);
QUnit.test("parse for bool", jsMetaStream.parseForBool);
QUnit.test("parse for string", jsMetaStream.parseForString);
QUnit.test("parse for object", jsMetaStream.parseForObject);

QUnit.test("parse while int", jsMetaStream.parseWhileInt);
QUnit.test("parse while float", jsMetaStream.parseWhileFloat);
QUnit.test("parse while bool", jsMetaStream.parseWhileBool);
QUnit.test("parse while string", jsMetaStream.parseWhileString);
QUnit.test("parse while object", jsMetaStream.parseWhileObject);

