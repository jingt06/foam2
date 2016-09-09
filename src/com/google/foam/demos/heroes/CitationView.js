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

  methods: [
    function initE() {
      this.
        start('span').
          on('click', this.onClick).
          add(this.data.id, ' ').
          entity('nbsp').
          add(' ', this.data.name).
        end().
        add(this.REMOVE);
    }
  ],

  actions: [
    {
      name: 'remove',
      label: ' X ',
      code: function(X) { X.heroDAO.remove(X.data); console.log('remove', X.data.id); }
    }
  ],

  listeners: [
    function onClick() { this.editHero(this.data); }
  ]
});