/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年10月13日
 */

$import("js.lang.System");
Class.forName({
    name : "public class js.util.Arrays",

    // Suppresses default constructor, ensuring non-instantiability.
    "private Arrays" : function() {
    },

    "public static copyOf" : function(original, newLength) {
        var copy = [];
        js.lang.System.arraycopy(original, 0, copy, 0, Math.min(original.length, newLength));
        return copy;
    },

    "public static copyOfRange" : function(original, from, to) {
        var newLength = to - from;
        if (newLength < 0)
            throw new js.lang.IllegalArgumentException(from + " > " + to);

        var copy = [];
        js.lang.System.arraycopy(original, from, copy, 0, Math.min(original.length - from, newLength));
        return copy;
    },

    /**
     * Returns <tt>true</tt> if the two specified arrays of booleans are
     * <i>equal</i> to one another.  Two arrays are considered equal if both
     * arrays contain the same number of elements, and all corresponding pairs
     * of elements in the two arrays are equal.  In other words, two arrays
     * are equal if they contain the same elements in the same order.  Also,
     * two array references are considered equal if both are <tt>null</tt>.<p>
     *
     * @param a one array to be tested for equality
     * @param a2 the other array to be tested for equality
     * @return <tt>true</tt> if the two arrays are equal
     */
    "public static boolean equals" : function(a, a2) {
        if (a == a2)
            return true;
        if (a == null || a2 == null)
            return false;

        var length = a.length;
        if (a2.length != length)
            return false;

        for (var i = 0; i < length; i++) {
            var o1 = a[i];
            var o2 = a2[i];
            if (!(o1 == null ? o2 == null : o1.equals(o2)))
                return false;
        }

        return true;
    }
});
