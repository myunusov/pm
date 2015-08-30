/*
 * Copyright (c) 2014 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package org.maxur.perfmodel.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.util.Optional;

import static java.lang.String.format;
import static java.util.Optional.empty;
import static javax.swing.SwingUtilities.invokeLater;
import static org.maxur.perfmodel.backend.utils.OsUtils.isWindows;

/**
 * This class represents Performance Model Calculator Application
 * It's GUI Implementation with Tray Icon
 *
 * @author Maxim
 * @version 1.0
 * @since <pre>24.10.2014</pre>
 * <p>
 * see http://docs.oracle.com/javase/tutorial/displayCode.html?code=http://docs.oracle.com/javase/tutorial/uiswing/examples/misc/TrayIconDemoProject/src/misc/TrayIconDemo.java
 */
public class TrayIconApplication extends Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(TrayIconApplication.class);

    public static final String IMG_FAVICON_PATH = "/img/favicon.png";

    TrayIconApplication() {
    }

    @Override
    public boolean isApplicable() {
        //Check the SystemTray support
        return SystemTray.isSupported();
    }

    @Override
    protected void onInit() {
        try {
            final String className = isWindows() ?
                    "com.sun.java.swing.plaf.windows.WindowsLookAndFeel" :
                    "javax.swing.plaf.metal.MetalLookAndFeel";
            UIManager.setLookAndFeel(className);
        } catch (UnsupportedLookAndFeelException | IllegalAccessException
                | InstantiationException | ClassNotFoundException ex
                ) {
            LOGGER.error("Tray application is not created", ex);
        }
        UIManager.put("swing.boldMetal", Boolean.FALSE);
    }

    @Override
    protected void onStart() {
        invokeLater(this::run);
    }

    private void run() {
        final PopupMenu popup = new PopupMenu();
        final Optional<Image> image = createImage(IMG_FAVICON_PATH, "tray icon");
        final Image img;
        if (image.isPresent()) {
            img = image.get();
        } else {
            img = createImageFrom();
            LOGGER.error(format("Resource '%s' is not found", IMG_FAVICON_PATH));
        }
        final TrayIcon trayIcon = new TrayIcon(img);
        final SystemTray tray = SystemTray.getSystemTray();
        trayIcon.setToolTip("Performance Model Calculator");
        trayIcon.setImageAutoSize(true);

        MenuItem aboutItem = new MenuItem("About");
        MenuItem startClientItem = new MenuItem("Start Client");
        MenuItem manageServiceItem = new MenuItem("Stop Service");
        MenuItem exitItem = new MenuItem("Exit");

        //Add components to popup menu
        popup.add(startClientItem);
        popup.add(manageServiceItem);
        popup.add(aboutItem);
        popup.addSeparator();
        popup.add(exitItem);

        trayIcon.setPopupMenu(popup);

        try {
            tray.add(trayIcon);
        } catch (AWTException e) {
            LOGGER.debug("TrayIcon could not be added.", e);
            LOGGER.error("TrayIcon could not be added.");
            return;
        }

        trayIcon.addActionListener(e -> openBrowser());

        startClientItem.addActionListener(e -> openBrowser());

        manageServiceItem.addActionListener(e -> {
            if (webServer().isStarted()) {
                webServer().stop();
            } else {
                webServer().restart();
            }
            final String label = webServer().isStarted() ? "Stop Service" : "Start Service";
            manageServiceItem.setLabel(label);
            final String message = webServer().isStarted() ? "Web Service was started" : "Web Service was stopped";
            trayIcon.displayMessage("Performance Model Calculator",
                    message,
                    TrayIcon.MessageType.INFO);
            startClientItem.setEnabled(webServer().isStarted());
        });

        aboutItem.addActionListener(e -> JOptionPane.showMessageDialog(null,
                "Performance Model Calculator. Version: " + this.getClass().getPackage().getImplementationVersion()));


        exitItem.addActionListener(e -> {
            tray.remove(trayIcon);
            webServer().stop();
            SystemTray.getSystemTray().remove(trayIcon);
            System.exit(0);

        });
    }

    private static Image createImageFrom() {
        BufferedImage bufferedImage = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        Graphics graphics = bufferedImage.getGraphics();
        graphics.setColor(Color.RED);
        graphics.fillRect(0, 0, 100, 100);
        return bufferedImage;
    }

    //Obtain the image URL
    private static Optional<Image> createImage(String path, String description) {
        final URL imageURL = TrayIconApplication.class.getResource(path);
        return imageURL == null ? empty() : Optional.of((new ImageIcon(imageURL, description)).getImage());
    }

    private void openBrowser() {
        URI uri = URI.create(propertiesService().baseUrl());
        Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;
        if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
            try {
                desktop.browse(uri);
            } catch (IOException e) {
                LOGGER.error("Cannot open browser", e);
            }
        }
    }


}


