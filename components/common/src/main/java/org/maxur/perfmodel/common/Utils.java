package org.maxur.perfmodel.common;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Pattern;

/**
 * Common Utils Class.
 *
 * @author Maxim Yunusov
 * @version 1.0
 * @since  <pre>10/4/13</pre>
 */
public final class Utils {

    private Utils() {
        //empty - prevent construction
    }

    /**
     * Text has content check.
     *
     * @param value the value
     * @return true if text has any content
     */
    public static boolean textHasContent(final String value) {
        return !StringUtils.isBlank(value);
    }

    /**
     * Is in range check.
     *
     * @param value the value
     * @param low the low
     * @param high the high
     * @return true if value is in range
     */
    public static boolean isInRange(final int value, final int low, final int high) {
        return value >= low && value <= high;
    }

    /**
     * Matches boolean.
     *
     * @param value the value
     * @param pattern the pattern
     * @return true if value matches to pattern
     */
    public static boolean matches(final String value, final Pattern pattern) {
        return pattern.matcher(value).matches();
    }

    /**
     * Quote string.
     *
     * @param value the value
     * @return the quoted text
     */
    public static String quote(final String value) {
        return "\"" + value + "\"";
    }
}
