package org.maxur.perfmodel.common;

import java.util.regex.Pattern;

import static org.maxur.perfmodel.common.Utils.matches;
import static org.maxur.perfmodel.common.Utils.quote;
import static org.maxur.perfmodel.common.Utils.textHasContent;

/**
 * Argument Validation Utils (DbC).
 *
 * @author Maxim Yunusov
 * @version 1.0
 * @since  <pre>10/4/13</pre>
 */
public final class Args {


    private Args(){
        //empty - prevent construction
    }

    /**
     *If <code>value</code> does not satisfy {@link Utils#textHasContent}, then
     *throw an <code>IllegalArgumentException</code>.

     *<P>Most text used in an application is meaningful only if it has visible content.
     *
     * @param value the value
     */
    public static void isNotBlank(final String value){
        if(!textHasContent(value)){
            throw new IllegalArgumentException("Value has no visible content");
        }
    }

    /**
     *If {@link Utils#isInRange} returns <code>false</code>, then
     *throw an <code>IllegalArgumentException</code>.
     *
     * @param value the value
     * @param low is less than or equal to <code>high</code>.
     * @param high the high
     */
    public static void isInRange(final int value, final int low, final int high) {
        if (!Utils.isInRange(value, low, high) ) {
            throw new IllegalArgumentException(value + " not in range " + low + ".." + high);
        }
    }

    /**
     *If <tt>value</tt> is less than <tt>1</tt>, then throw an
     *<tt>IllegalArgumentException</tt>.
     * @param value the value
     */
    public static void isPositive(final int value) {
        if (value < 1) {
            throw new IllegalArgumentException(value + " is not positive");
        }
    }

    /**
     *If {@link Utils#matches} returns <tt>false</tt>, then throw an <code>IllegalArgumentException</code>.
     * @param value the value
     * @param pattern the pattern
     */
    public static void isMatch(final String value, final Pattern pattern){
        if (!matches(value, pattern)){
            throw new IllegalArgumentException(
                    "Value " + quote(value) + " does not match " + quote(pattern.pattern())
            );
        }
    }

    /**
     * If <code>value</code> is null, then throw a <code>IllegalArgumentException</code>.
     * @param value the value
     */
    public static void isNotNull(final Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Value is Empty");
        }
    }


}
