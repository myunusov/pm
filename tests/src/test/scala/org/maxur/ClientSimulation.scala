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

package org.maxur

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

class ClientSimulation extends Simulation {

  val httpProtocol = http
    .baseURL("http://localhost:8080")
    .inferHtmlResources()
    .acceptHeader( """*/*""")
    .acceptEncodingHeader( """gzip,deflate""")
    .contentTypeHeader( """application/json; charset=windows-1251""")
    .userAgentHeader( """Apache-HttpClient/4.3.2 (java 1.5)""")

  val headers_0 = Map( """Cache-Control""" -> """no-cache""")

  val uri1 = """localhost"""

  val scn = scenario("Find All")
    .repeat(1000) {
    exec(http("find all")
      .get( """/api/project""")
      .headers(headers_0)
    )
      .pause(100 milliseconds)
  }

  setUp(scn.inject(atOnceUsers(10))).protocols(httpProtocol)
}
