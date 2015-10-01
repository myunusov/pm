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

package org.maxur.perfmodel.backend.domain;

import static java.lang.String.format;

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>08.09.2015</pre>
 */
public class ConflictException extends Exception {

    private static final long serialVersionUID = 8538245899720208225L;

    /**
     * Create Validation Exception.
     * <p>
     * @param message message template.
     * @param args Arguments referenced by the format specifiers in the format string.
     */
    public ConflictException(final String message, final String... args) {
        super(format(message, args));
    }
}
