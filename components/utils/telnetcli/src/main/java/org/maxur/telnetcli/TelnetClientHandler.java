package org.maxur.telnetcli;

import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

import static java.lang.System.err;
import static java.lang.System.out;

/**
 * Handles a client-side channel.
 *
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>31/07/13</pre>
 */
@ChannelHandler.Sharable
public class TelnetClientHandler extends SimpleChannelInboundHandler<String> {

    @Override
    protected void channelRead0(final ChannelHandlerContext ctx, final String msg) {
        out.println(msg);
    }

    @Override
    public void exceptionCaught(final ChannelHandlerContext ctx, final Throwable cause) {
        err.println("Unexpected exception from downstream.\n" + cause.getMessage());
        ctx.close();
    }
}
