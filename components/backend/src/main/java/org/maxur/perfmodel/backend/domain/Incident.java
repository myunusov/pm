/*
 * Copyright (c) 2013 Maxim Yunusov
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

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.List;

import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/25/13</pre>
 */
@XmlRootElement
public class Incident implements Serializable {

    private static final long serialVersionUID = 2368849548039200044L;

    private String message;

    @SuppressWarnings("UnusedDeclaration")
    public Incident() {
    }

    public Incident(final String message) {
        this.message = message;
    }

    public static List<Incident> incidents(final String... messages) {
        return stream(messages).map(Incident::new).collect(toList());
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getMessage() {
        return message;
    }
}
