# Generated by Django 2.0.13 on 2019-05-06 21:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailimages', '0021_rendition_alt_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='alt_text',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='rendition',
            name='alt_text',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='userrendition',
            name='alt_text',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
