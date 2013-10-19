package org.maxur.telnetcli;

import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.DelimiterBasedFrameDecoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * @author Maxim Yunusov
 * @version 1.0 03.08.13
 */
@RunWith(MockitoJUnitRunner.class)
public class TelnetClientInitializerTest {

    private TelnetClientInitializer initializer;

    @Mock
    private SocketChannel channel;

    @Mock
    private ChannelPipeline pipeline;

    @Before
    public void setUp() throws Exception {
        initializer = new TelnetClientInitializer();
        when(channel.pipeline()).thenReturn(pipeline);
    }

    @Test
    public void testInitChannel() throws Exception {
        initializer.initChannel(channel);
        verify(pipeline).addLast(eq("framer"), any((DelimiterBasedFrameDecoder.class)));
        verify(pipeline).addLast(eq("decoder"), any((StringDecoder.class)));
        verify(pipeline).addLast(eq("encoder"), any((StringEncoder.class)));
        verify(pipeline).addLast(eq("handler"), any(TelnetClientHandler.class));
    }
}
