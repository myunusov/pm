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

package org.maxur.perfmodel.backend.service.impl;

import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.service.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Named;
import javax.swing.*;
import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.net.URL;

import static java.awt.Desktop.Action.BROWSE;
import static java.awt.Desktop.getDesktop;
import static java.awt.Desktop.isDesktopSupported;
import static java.awt.SystemTray.getSystemTray;
import static java.lang.String.format;
import static javax.swing.JOptionPane.showMessageDialog;
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
@Service
public class TrayIconApplication extends Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(TrayIconApplication.class);

    public static final String IMG_FAVICON_PATH = "/img/favicon.png";

    private TrayIcon trayIcon;

    @SuppressWarnings("unused")
    @Named("webapp.url")
    private URI webappUri;

    public TrayIconApplication() {
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
        trayIcon = new TrayIcon(createImage(IMG_FAVICON_PATH, "tray icon"));
        trayIcon.setToolTip("Performance Model Calculator");
        trayIcon.setImageAutoSize(true);
        trayIcon.setPopupMenu(createPopupMenu());
        trayIcon.addActionListener(e -> openBrowser());
        try {
            getSystemTray().add(trayIcon);
        } catch (AWTException e) {
            final String msg = "TrayIcon could not be added.";
            LOGGER.error(msg);
            throw new IllegalStateException(msg, e);
        }
    }

    private PopupMenu createPopupMenu() {
        final PopupMenu popup = new PopupMenu();

        final MenuItem aboutItem = new MenuItem("About");
        final MenuItem startClientItem = new MenuItem("Start Client");
        final MenuItem manageServiceItem = new MenuItem("Stop Service");
        final MenuItem exitItem = new MenuItem("Exit");

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

        aboutItem.addActionListener(e ->
                        showMessageDialog(null, "Performance Model Calculator. Version: " + version())
        );

        exitItem.addActionListener(e -> stop());

        popup.add(aboutItem);
        popup.add(startClientItem);
        popup.add(manageServiceItem);
        popup.addSeparator();
        popup.add(exitItem);

        return popup;
    }

    @Override
    protected void onStop() {
        getSystemTray().remove(trayIcon);
    }

    private static Image createImage(final String path, final String description) {
        final URL imageURL = TrayIconApplication.class.getResource(path);
        if (imageURL == null) {
            final String msg = format("Resource '%s' is not found", IMG_FAVICON_PATH);
            LOGGER.error(msg);
            throw new IllegalStateException(msg);
        }
        return (new ImageIcon(imageURL, description)).getImage();
    }

    private void openBrowser() {
        if (!isDesktopSupported()) {
            LOGGER.error("Cannot open browser. Desktop is not supported");
            return;
        }
        final Desktop desktop = getDesktop();
        if (!desktop.isSupported(BROWSE)) {
            LOGGER.error("Cannot open browser. Desktop is not supported browse action");
            return;
        }
        try {
            desktop.browse(webappUri);
        } catch (IOException e) {
            LOGGER.error("Cannot open browser", e);
        }
    }

}


