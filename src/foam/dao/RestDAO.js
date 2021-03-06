/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RestDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: function() {/*
    A client-side DAO for interacting with a REST endpoint.

    Sinks are managed on the client (i.e., sinks passed to
    select() will not serialize the sink and send it to the
    endpoint for server-side logic implementation).
  */},

  requires: [
    'foam.dao.ArraySink',
    'foam.net.HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'baseURL',
      documentation: 'URL for most rest calls. Some calls add "/<some-info>".',
      final: true,
      required: true
    }
  ],

  methods: [
    function put(o) {
      /**
       * PUT baseURL
       * <network-foam-jsonified FOAM object>
       */
      return this.createRequest_({
        method: 'PUT',
        url: this.baseURL,
        payload: this.jsonify_(o)
      }).send().then(this.onPutResponse);
    },

    function remove(o) {
      /**
       * DELETE baseURL/<network-foam-jsonified FOAM object id>
       */
      return this.createRequest_({
        method: 'DELETE',
        url: this.baseURL + '/' + encodeURIComponent(this.jsonify_(o.id))
      }).send().then(this.onRemoveResponse);
    },

    function find(id) {
      /**
       * GET baseURL/<network-foam-jsonified FOAM object id>
       */
      return this.createRequest_({
        method: 'GET',
        url: this.baseURL + '/' + encodeURIComponent(this.jsonify_(id))
      }).send().then(this.onFindResponse);
    },

    function select(sink, skip, limit, order, predicate) {
      /**
       * GET baseURL
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var query = [];
      if ( typeof skip !== 'undefined' )
        query.push('skip=' + encodeURIComponent(this.jsonify_(skip)));
      if ( typeof limit !== 'undefined' )
        query.push('limit=' + encodeURIComponent(this.jsonify_(limit)));
      if ( typeof order !== 'undefined' )
        query.push('order=' + encodeURIComponent(this.jsonify_(order)));
      if ( typeof predicate !== 'undefined' )
        query.push('predicate=' + encodeURIComponent(this.jsonify_(predicate)));

      return this.createRequest_({
        method: 'GET',
        url: this.baseURL + ':select?' + query.join('&')
      }).send().then(
        this.onSelectResponse.bind(this, sink || this.ArraySink.create()));
    },

    function removeAll(skip, limit, order, predicate) {
      /**
       * POST baseURL/removeAll
       * { skip, limit, order, predicate }
       *
       * Each key's value is network-foam-jsonified.
       */
      var payload = {};
      if ( typeof skip  !== 'undefined' ) payload.skip = skip;
      if ( typeof limit !== 'undefined' ) payload.limit = limit;
      if ( typeof order !== 'undefined' ) payload.order = order;
      if ( typeof predicate !== 'undefined' ) payload.predicate = predicate;

      return this.createRequest_({
        method: 'POST',
        url: this.baseURL + ':removeAll',
        payload: this.jsonify_(payload)
      }).send().then(this.onRemoveAllResponse);
    },

    function createRequest_(o) {
      // Demand that required properties are set before using DAO.
      this.validate();
      // Each request should default to a json responseType.
      return this.HTTPRequest.create(Object.assign({responseType: 'json'}, o));
    },

    function jsonify_(o) {
      // What's meant by network-foam-jsonified for HTTP/JSON/REST APIs:
      // Construct JSON-like object using foam's network strategy, then
      // construct well-formed JSON from the object.
      return JSON.stringify(foam.json.Network.objectify(o));
    }
  ],

  listeners: [
    function onResponse(name, response) {
      if ( response.status !== 200 ) {
        throw new Error(
          'Unexpected ' + name + ' response code from REST DAO endpoint: ' +
            response.status);
      }
    },

    function onPutResponse(response) {
      this.onResponse('put', response);
      var o = foam.json.parse(response.payload);
      this.pub('on', 'put', o);
      return o;
    },

    function onRemoveResponse(response) {
      this.onResponse('remove', response);
      var o = foam.json.parse(response.payload);
      if ( o !== null ) this.pub('on', 'remove', o);
      return o;
    },

    function onFindResponse(response) {
      this.onResponse('find', response);
      return foam.json.parse(response.payload);
    },

    function onSelectResponse(sink, response) {
      this.onResponse('select', response);
      var results = foam.json.parse(response.payload);
      for ( var i = 0; i < results.length; i++ ) {
        sink.put(results[i]);
      }
      sink.eof();
      return sink;
    },

    function onRemoveAllResponse(response) {
      this.onResponse('removeAll', response);
      return undefined;
    }
  ]
});
