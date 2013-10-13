# coding=utf-8
from django.contrib import admin
from django.contrib.auth.models import User

from django import forms
from django_ace import AceWidget

from quiz.models import Task, TaskCollection, TC_Membership


class TC_MembershipInline(admin.TabularInline):
    model = TC_Membership
    extra = 1
    ordering = ("ordering",)


class TaskAdminForm(forms.ModelForm):
    pass

    class Meta:
        model = Task
        widgets = {
            'body_xml': AceWidget(mode="xml", theme="solarized_light", width="100%")
        }


class TaskAdmin(admin.ModelAdmin):
    #    list_display = ('question', 'pub_date', 'was_published_recently')
    #    list_filter = ['was_published_recently']

    list_display = ['id', 'title', 'pub_date', 'revision']
    search_fields = ['title', 'tags']
    date_hierarchy = 'pub_date'
    inlines = (TC_MembershipInline,)
    list_filter = ['author']

    fieldsets = [
        (None, {'fields': ['title', 'body_xml', 'tags']}),
        ('Date', {'fields': ['pub_date'],
                  'description': 'Wird automatisch auf aktuelle Zeit gesetzt, kann aber geändert werden',
                  'classes': ('collapse',)}),
        #('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
    ]
    form = TaskAdminForm

    def save_model(self, request, task, form, change):

        if len(task.author) == 0:
            user = User.objects.get(username__exact = request.user)
            name = user.get_full_name()
            if len(name) == 0:
                name = user.get_short_name()
                if len(name) == 0:
                    name = user.get_username()

            task.author = name
            task.revision += 1
            task.save()


class TaskCollectionAdmin(admin.ModelAdmin):
    inlines = (TC_MembershipInline,)


admin.site.register(Task, TaskAdmin)
admin.site.register(TaskCollection, TaskCollectionAdmin)

