package org.maxur.telnetcli;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;

final class Command {

    private static final String EOL = "\r\n";

    private static final int ARGS_NUMBER = 3;

    private final String host;

    private final int port;

    private final String command;

    private Command(final String host, final int port, final String command) {
        this.host = host;
        this.port = port;
        this.command = command;
    }

    static Command make(final String[] args) {
        if (args.length != ARGS_NUMBER) {
            throw new IllegalArgumentException("\"Usage with arguments: <host> <port> <command>\"");
        }
        final String host = args[0];
        final int port = Integer.parseInt(args[1]);
        final String command = args[2];
        return new Command(host, port, command);
    }

    void run() throws InterruptedException {
        final EventLoopGroup group = new NioEventLoopGroup();
        try {
            send(makeChannel(group));
        } finally {
            group.shutdownGracefully();
        }
    }

    private void send(final Channel channel) throws InterruptedException {
        final ChannelFuture lastWriteFuture = channel.writeAndFlush(command + EOL);
        channel.closeFuture().sync();
        if (lastWriteFuture != null) {
            lastWriteFuture.sync();
        }
    }

    private Channel makeChannel(final EventLoopGroup group) throws InterruptedException {
        final Bootstrap bootstrap = new Bootstrap();
        bootstrap
                .group(group)
                .channel(NioSocketChannel.class)
                .handler(new TelnetClientInitializer());

        return bootstrap.connect(host, port).sync().channel();
    }

}
