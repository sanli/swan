#!/bin/bash
rsync -av --exclude-from .rsync_exclude /Users/lishuangtao/workspace/swan swan@swan:/home/swan
