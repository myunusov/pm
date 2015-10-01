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

import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.hk2.api.ServiceLocatorFactory;
import org.maxur.perfmodel.backend.service.Application;

import static org.glassfish.hk2.utilities.ServiceLocatorUtilities.bind;

/**
 * Performance Model Calculator Standalone Launcher.
 *
 * @author Maxim Yunusov
 * @version 1.0 14.09.2014
 */
public final class Launcher {

    /**
     * Utils class.
     */
    private Launcher() {
    }

    /**
     * Command line entry point. This method kicks off the building of a application  object
     * and executes it.
     * <p>
     * @param args - arguments of command.
     */
    public static void main(String[] args) {
        final ServiceLocatorFactory locatorFactory = ServiceLocatorFactory.getInstance();
        final ServiceLocator locator = locatorFactory.create("PmcLocator");
        bind(locator, new Config());
        final Application application = locator.getService(Application.class);
        application.start();
    }


}
