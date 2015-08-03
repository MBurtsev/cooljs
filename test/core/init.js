var initTest =
{
    check: function (obj, assert)
    {
        assert.ok(obj._cool != null, "Cool object created");
        assert.ok(obj._cool.hash != null, "Hash defined");
        assert.ok(obj._cool.hash < cool.lastHash, "Hash is fine");
        assert.ok(obj._cool.tagName != null, "Tag name defined");
        assert.ok(typeof obj._cool.parent != "undefined", "Parent defined");
        assert.ok(obj._cool.chields != null, "Chields collection defined");
        assert.ok(obj._cool.isActive != null, "isActive property defined");
        assert.ok(typeof obj._cool.init == "function", "Function init defined");
        assert.ok(typeof obj._cool.action == "function", "Function action defined");
        assert.ok(typeof obj._cool.cancel == "function", "Function cancel defined");
        assert.ok(typeof obj._cool.actionBase == "function", "Function actionBase defined");
        assert.ok(typeof obj._cool.cancelBase == "function", "Function cancelBase defined");
        assert.ok(typeof obj._cool.clear == "function", "Function clear defined");
    }
};