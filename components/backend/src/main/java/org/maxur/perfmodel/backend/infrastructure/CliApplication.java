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

package org.maxur.perfmodel.backend.infrastructure;

import org.maxur.perfmodel.backend.service.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * This class represents Performance Model Calculator Application.
 * It's CLI Implementation.
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
public final class CliApplication extends Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(CliApplication.class);

    public CliApplication() {
    }

    @Override
    public boolean isApplicable() {
        return true;
    }

    @Override
    public void onStart() {
        LOGGER.info("Press Enter to stop\n");
        try {
            //noinspection ResultOfMethodCallIgnored
            System.in.read();
            stop();
        } catch (IOException e) {
            LOGGER.error(e.getMessage(), e);
        }
    }

}
