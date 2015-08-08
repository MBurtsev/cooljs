// Helper class
var h =
{
    // check result data with source
    checkData: function (src, dst, assert)
    {
        var flag = src.length == dst.length;

        assert.ok(flag, "Data len fine");

        if (flag)
        {
            for (var i = 0; i < src.length; ++i)
            {
                var itm0 = src[i];
                var itm1 = dst[i];

                if (typeof itm0 == "object")
                {
                    flag = h.compareObjects(itm0, itm1, assert);

                    if (!flag)
                    {
                        break;
                    }
                }
                else
                {
                    flag = itm0 == itm1;

                    if (!flag)
                    {
                        assert.ok(false, "[" + i + "]" + " Data has value: " + itm1 + ", but must be: " + itm0);

                        break;
                    }
                }
            }
        }

        if (flag)
        {
            assert.ok(true, "Data check done.");
        }

        return flag;
    },

    // comparing all properties
    compareObjects: function (itm0, itm1, assert)
    {
        var flag = true;

        for (var p in itm0)
        {
            if (itm0.hasOwnProperty(p))
            {
                if (itm0[p] instanceof Array)
                {
                    flag = h.checkData(itm0[p], itm1[p], assert);

                    if (!flag)
                    {
                        break;
                    }

                    continue;
                }

                if (typeof itm0[p] == "object")
                {
                    flag = typeof itm1[p] == "object";

                    if (!flag)
                    {
                        assert.ok(false, "Destination property is not object: " + p);

                        break;
                    }

                    flag = h.compareObjects(itm0[p], itm1[p], assert);

                    if (!flag)
                    {
                        break;
                    }

                    continue;
                }

                flag = itm1[p] != null;

                if (!flag)
                {
                    assert.ok(false, "Destination data object dosn't have property: " + p);

                    break;
                }

                flag = itm0[p] == itm1[p];

                if (!flag)
                {
                    assert.ok(false, "Property " + p + " has value: " + itm1[p] + ", but must be: " + itm0[p]);

                    break;
                }
            }
        }

        return flag;
    },
};