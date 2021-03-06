/*
 * Copyright (c) 2015 Maxim Yunusov
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

import org.glassfish.hk2.api.Factory;
import org.glassfish.hk2.api.ServiceLocator;
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.service.impl.CliApplication;
import org.maxur.perfmodel.backend.service.impl.TrayIconApplication;
import org.maxur.perfmodel.backend.service.Application;
import org.slf4j.Logger;

import javax.inject.Inject;

import static org.slf4j.LoggerFactory.getLogger;

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>01.09.2015</pre>
 */
@Service
public class ApplicationProvider implements Factory<Application> {

    private static final Logger LOGGER = getLogger(ApplicationProvider.class);

    private Application application;

    @Inject
    private ServiceLocator locator;

    @Override
    public Application provide() {
        if (application == null) {
            application = make();
            locator.inject(application);
        }
        return application;
    }

    private Application make() {
        final Application result = new TrayIconApplication();
        if (result.isApplicable()) {
            return result;
        } else {
            LOGGER.info("SystemTray is not supported");
        }
        return new CliApplication();
    }

    @Override
    public void dispose(Application instance) {
        instance.stop();
    }
}
