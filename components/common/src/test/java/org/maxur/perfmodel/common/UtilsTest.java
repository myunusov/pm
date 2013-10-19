package org.maxur.perfmodel.common;

import org.junit.Test;

import static java.util.regex.Pattern.compile;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.maxur.perfmodel.common.Utils.isInRange;
import static org.maxur.perfmodel.common.Utils.matches;
import static org.maxur.perfmodel.common.Utils.quote;
import static org.maxur.perfmodel.common.Utils.textHasContent;

/**
 * @author Maxim Yunusov
 * @version 1.0 18.10.13
 */

public class UtilsTest {

    @Test
    public void testCheckForEmptyContent() throws Exception {
        assertFalse(textHasContent(""));
    }
    @Test
    public void testCheckForNullContent() throws Exception {
        assertFalse(textHasContent(null));
    }
    @Test
    public void testCheckForBlankContent() throws Exception {
        assertFalse(textHasContent(" "));
    }
    @Test
    public void testCheckForContent() throws Exception {
        assertTrue(textHasContent("a"));
    }

    @Test
    public void testCheckForRangeForEquals() throws Exception {
        assertTrue(isInRange(1, 1, 1));
    }
    @Test
    public void testCheckForRangeForLow() throws Exception {
        assertFalse(isInRange(1, 2, 3));
    }
    @Test
    public void testCheckForRangeFoHigh() throws Exception {
        assertFalse(isInRange(3, 1, 2));
    }
    @Test
    public void testCheckForRange() throws Exception {
        assertTrue(isInRange(2, 1, 3));
    }

    @Test
    public void testCheckForMatch() throws Exception {
        assertTrue(matches("a", compile("a|b")));
    }

    @Test
    public void testCheckForNotMatch() throws Exception {
        assertFalse(matches("c", compile("a|b")));
    }

    @Test
    public void testQuote() throws Exception {
        assertEquals("\"s\"" ,quote("s"));
    }
}
