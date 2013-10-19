package org.maxur.perfmodel.common;

import org.junit.Test;

import static java.util.regex.Pattern.compile;
import static org.maxur.perfmodel.common.Args.isNotBlank;
import static org.maxur.perfmodel.common.Args.isMatch;
import static org.maxur.perfmodel.common.Args.isNotNull;
import static org.maxur.perfmodel.common.Args.isPositive;
import static org.maxur.perfmodel.common.Args.isInRange;

/**
 * @author Maxim Yunusov
 * @version 1.0 18.10.13
 */
public class ArgsTest {

    @Test(expected = IllegalArgumentException.class)
    public void testCheckForEmptyContent() throws Exception {
        isNotBlank("");
    }
    @Test(expected = IllegalArgumentException.class)
    public void testCheckForNullContent() throws Exception {
        isNotBlank(null);
    }
    @Test(expected = IllegalArgumentException.class)
    public void testCheckForBlankContent() throws Exception {
        isNotBlank(" ");
    }
    @Test
    public void testCheckForContent() throws Exception {
        isNotBlank("a");
    }

    @Test
    public void testCheckForRangeForEquals() throws Exception {
        isInRange(1, 1, 1);
    }
    @Test(expected = IllegalArgumentException.class)
    public void testCheckForRangeForLow() throws Exception {
        isInRange(1, 2, 3);
    }
    @Test(expected = IllegalArgumentException.class)
    public void testCheckForRangeFoHigh() throws Exception {
        isInRange(3, 1, 2);
    }
    @Test
    public void testCheckForRange() throws Exception {
        isInRange(2, 1, 3);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCheckForPositiveWithZero() throws Exception {
        isPositive(0);
    }
    @Test(expected = IllegalArgumentException.class)
    public void testCheckForPositiveWithNegative() throws Exception {
        isPositive(-1);
    }
    @Test
    public void testCheckForPositive() throws Exception {
        isPositive(1);
    }

    @Test
    public void testCheckForMatch() throws Exception {
        isMatch("a", compile("a|b"));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCheckForNotMatch() throws Exception {
        isMatch("c", compile("a|b"));
    }

    @Test
    public void testCheckForNullWithNotNull() throws Exception {
        isNotNull("a");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCheckForNull() throws Exception {
        isNotNull(null);
    }
}
