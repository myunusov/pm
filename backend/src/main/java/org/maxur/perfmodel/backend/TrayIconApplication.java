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

import org.maxur.perfmodel.backend.infrastructure.PropertiesService;
import org.maxur.perfmodel.backend.infrastructure.WebServer;
import org.maxur.perfmodel.backend.rest.ApplicationResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.net.URI;
import java.net.URL;
import javax.swing.*;

import static org.maxur.perfmodel.backend.utils.OsUtils.isWindows;

/**
 * @author Maxim
 * @version 1.0
 * @since <pre>24.10.2014</pre>
 *
 * see http://docs.oracle.com/javase/tutorial/displayCode.html?code=http://docs.oracle.com/javase/tutorial/uiswing/examples/misc/TrayIconDemoProject/src/misc/TrayIconDemo.java
 */
public class TrayIconApplication {

    private static final Logger LOGGER = LoggerFactory.getLogger(TrayIconApplication.class);

    private final WebServer webServer;
    private final PropertiesService propertiesService;
    private final boolean isReady;

    public TrayIconApplication(final WebServer webServer, final PropertiesService propertiesService) {
        this.webServer = webServer;
        this.propertiesService = propertiesService;
        //Check the SystemTray support
        isReady = SystemTray.isSupported();
        if (!isReady) {
            LOGGER.info("SystemTray is not supported");
        } else {
            try {
                if (isWindows()) {
                    UIManager.setLookAndFeel("com.sun.java.swing.plaf.windows.WindowsLookAndFeel");
                } else {
                    UIManager.setLookAndFeel("javax.swing.plaf.metal.MetalLookAndFeel");
                }
            } catch (UnsupportedLookAndFeelException | IllegalAccessException
                    | InstantiationException | ClassNotFoundException ex
                    ) {
                LOGGER.error("Tray application is not created", ex);
            }
            UIManager.put("swing.boldMetal", Boolean.FALSE);
        }
    }

    public boolean isReady() {
        return isReady;
    }

    public void start() {
        SwingUtilities.invokeLater(this::run);
    }

    private void run() {

        final PopupMenu popup = new PopupMenu();
        final TrayIcon trayIcon =
                new TrayIcon(createImage("/img/favicon.png", "tray icon"));
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
            LOGGER.error("TrayIcon could not be added.");
            return;
        }

        trayIcon.addActionListener(e -> openBrowser());

        startClientItem.addActionListener(e -> openBrowser());

        manageServiceItem.addActionListener(e -> {
            if (webServer.isStarted()) {
                webServer.stop();
            } else {
                webServer.restart();
            }
            final String label = webServer.isStarted() ? "Stop Service" : "Start Service";
            manageServiceItem.setLabel(label);
            final String message = webServer.isStarted() ? "Web Service was started" : "Web Service was stopped";
            trayIcon.displayMessage("Performance Model Calculator",
                    message,
                    TrayIcon.MessageType.INFO);
            startClientItem.setEnabled(webServer.isStarted());
        });

        aboutItem.addActionListener(e -> JOptionPane.showMessageDialog(null,
                "Performance Model Calculator. Version: " + ApplicationResource.VERSION));


        exitItem.addActionListener(e -> {
            tray.remove(trayIcon);
            webServer.stop();
            SystemTray.getSystemTray().remove(trayIcon);
            System.exit(0);

        });
    }

    //Obtain the image URL
    protected static Image createImage(String path, String description) {
        URL imageURL = TrayIconApplication.class.getResource(path);
        if (imageURL == null) {
            LOGGER.error("Resource not found: " + path);
            return null;
        } else {
            return (new ImageIcon(imageURL, description)).getImage();
        }
    }

    public void openBrowser() {
        String baseUrl = propertiesService.asString("webapp.url", "http://localhost:9090/");
        URI uri = URI.create(baseUrl);
        Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;
        if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
            try {
                desktop.browse(uri);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


}


