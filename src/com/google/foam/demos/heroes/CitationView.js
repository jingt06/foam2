/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.foam.demos.heroes',
  name: 'CitationView',
  extends: 'foam.u2.View',

  imports: [
    'heroDAO',
    'editHero'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ {
          padding-right: 8px;
          margin: 8px;
          display: flex;
          background: #DDD;
          width: 200px;
          border-radius: 5px;
        }
        ^:hover {
          background: #EEE;
        }
        ^id {
          padding: 8px;
          border-radius: 4px 0 0 4px;
          color: white;
          background: #607D8B;
        }
        ^name {
          margin: 8px 0 0 10px;
          width: 100%;
        }
        ^ button {
          box-shadow: none;
          cursor: pointer;
          border: none;
          border-radius: 4px;
          padding: 6px 8px;
          margin: 4px;
          background: gray;
          color: white;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.
        cssClass(this.myCls()).
        on('click', this.onClick).
        start('div').cssClass(this.myCls('id')).add(this.data.id).end().
        start('div').cssClass(this.myCls('name')).add(this.data.name).end().
        add(this.REMOVE_HERO);
    }
  ],

  actions: [
    {
      name: 'removeHero',
      label: 'X',
      code: function(X) { X.heroDAO.remove(this); }
    }
  ],

  listeners: [
    function onClick() { this.editHero(this.data); }
  ]
});
