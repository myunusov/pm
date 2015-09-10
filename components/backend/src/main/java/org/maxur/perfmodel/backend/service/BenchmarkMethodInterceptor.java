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

package org.maxur.perfmodel.backend.service;

import com.ecyrd.speed4j.StopWatch;
import com.ecyrd.speed4j.StopWatchFactory;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import java.lang.reflect.Method;

/**
 * This is an interceptor that will implement benchmark of method latency.
 * <p>
 * This interceptor does not import any hk2 API and thus
 * is a pure AOP Alliance method interceptor that might be
 * used in any software that enabled AOP Alliance interceptors
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>02.09.2015</pre>
 */
public class BenchmarkMethodInterceptor implements MethodInterceptor {

    private final StopWatchFactory stopWatchFactory = StopWatchFactory.getInstance("loggingFactory");


    /*
     * (non-Javadoc)
     * @see org.aopalliance.intercept.MethodInterceptor#invoke(org.aopalliance.intercept.MethodInvocation)
     */
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        final Method method = invocation.getMethod();
        final StopWatch stopWatch = stopWatchFactory.getStopWatch();
        final String className = method.getDeclaringClass().getSimpleName();
        final String methodName = method.getName();
        try {
            Object result = invocation.proceed();
            stopWatch.stop(className + " " + methodName + " : success");
            return result;
        } catch (Exception e) {
            stopWatch.stop(className + " " + methodName + " : error");
            throw e;
        }
    }

}
