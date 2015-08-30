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
import static org.slf4j.LoggerFactory.getLogger;

/**
 * Performance Model Calculator Standalone Launcher
 *
 * @author Maxim Yunusov
 * @version 1.0 14.09.2014
 */
public final class Launcher {

    private static final Logger LOGGER = getLogger(Launcher.class);

    private Launcher() {
    }

    public static void main(String[] args) throws Exception {
        final Application application = makeApplication();
        application.init();
        application.start();
    }

    private static Application makeApplication() {
        final TrayIconApplication application = new TrayIconApplication();
        if (application.isApplicable()) {
            return application;
        } else {
            LOGGER.info("SystemTray is not supported");
        }
        return new CliApplication();
    }


}
