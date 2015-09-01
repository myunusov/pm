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

package org.maxur.perfmodel.backend.utils;

import java.util.Timer;
import java.util.TimerTask;

/**
 * Date Time Utils class.
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>01.09.2015</pre>
 */
public final class DateTimeUtils {

    private DateTimeUtils() {
    }

    /**
     * Postpone operation for delay milliseconds.
     * While server sends stop request to client.
     *
     * @param operation postponed operation.
     * @param delay duration of delay to operation.
     */
    public static TimerTask schedule(final Runnable operation, long delay) {
        final Timer timer = new Timer();
        final TimerTask task = new TimerTask() {
            public void run() {
                operation.run();
            }
        };
        timer.schedule(task, delay);
        return task;
    }
}