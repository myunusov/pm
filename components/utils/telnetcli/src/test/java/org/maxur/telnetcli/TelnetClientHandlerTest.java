package org.maxur.telnetcli;

import io.netty.channel.ChannelHandlerContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Mockito.verify;

/**
 * @author Maxim Yunusov
 * @version 1.0 03.08.13
 */
@RunWith(MockitoJUnitRunner.class)
public class TelnetClientHandlerTest {

    private TelnetClientHandler handler;

    @Mock
    private ChannelHandlerContext ctx;

    @Before
    public void setUp() throws Exception {
        handler = new TelnetClientHandler();
    }

    @Test
    public void testChannelRead0() throws Exception {
        handler.channelRead0(ctx, "message");
    }

    @Test
    public void testExceptionCaught() throws Exception {
        handler.exceptionCaught(ctx, new Exception());
        verify(ctx).close();
    }
}
