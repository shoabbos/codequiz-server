# -*- coding: utf-8 -*-

from django.conf.urls import patterns, url
from quiz import views

urlpatterns = patterns('',
                       url(r'^$', views.index, kwargs={"template":"index.html"}, name='index'),
                       url(r'^about$', views.simple, kwargs={"template":"about.html"}, name='about'),
                       url(r'^debug1$', views.debug1, name='debug1'),
                       #url(r'^task/view/(?P<task_id>\d+)/$', views.task_view, name='task_view'),
                       #url(r'^test/run/(?P<tc_id>\d+)/(?P<tc_task_id>\d+)/$', views.tc_run_view, name='tc_run_view'), # old one
                       url(r'^test/run/', views.tc_run_view2, name='tc_run_view2'),
                       url(r'^test/result/(?P<tc_id>\d+)/(?P<tc_task_id>\d+)/$',
                           views.tc_run_form_process, name='tc_run_form_process'),
                       url(r'^test/(?P<tc_id>\d+)/$', views.task_collection_view, name='task_collection_view'),
                       url(r'^result/(?P<task_id>\d+)/$', views.form_result_view, name='task_form_process'),
                       # view for showing a specific task outside of a tc
                       # TODO: this should be restricted to moderators
                       url(r'^explicit/(?P<task_id>\d+)/$',
                           views.debug_explicit_task_view, name='explicit_task_view'),
                       # debug mode
                       url(r'^task_process/$',
                           views.debug_task_process, name='debug_task_process'),
)
