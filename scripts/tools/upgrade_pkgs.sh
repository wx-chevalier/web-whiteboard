#!/bin/bash
set -ex

ncu
 
(cd ./packages/lego-form-core && ncu)
(cd ./packages/lego-form-bootstrap && ncu)
(cd ./packages/lego-form-host-app && ncu)
(cd ./packages/lego-form-mobx-app && ncu)
