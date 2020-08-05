from django.shortcuts import render
import random
from markdown2 import Markdown

from . import util


def index(request):
    query = request.GET.get('q')
    if util.get_entry(query):
        return wiki(request, query)
    elif query is not None:
        return search(request, query)
    else:
        return render(request, "encyclopedia/index.html", {"entries": util.list_entries()})


def wiki(request, title):
    # Handle title and see if the page is valid
    # if valid get the title, and the content and send it to render
    # else display error message
    if title:
        if util.get_entry(title):
            page_data = util.get_entry(title)
            md_2_html = Markdown().convert(page_data)
            return render(request, 'encyclopedia/article.html', {"title": title, "page_data": md_2_html})
        else:
            return render(request, 'encyclopedia/error.html', {"message": "The Page You Requested Does Not Exist"}, status=404)


def search(request, query):
    entries = util.list_entries()
    print(entries)
    results = [sub for sub in entries if query.lower() in sub.lower()]
    print(results)
    return render(request, "encyclopedia/search.html", {'results': results})


def new(request):
    if request.method == 'GET':
        return render(request, 'encyclopedia/new.html')
    elif request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        if util.get_entry(title):
            return render(request, 'encyclopedia/error.html', {"message": "This Page Already Exists"}, status=404)
        else:
            util.save_entry(title, content)
            return wiki(request, title)


def edit(request, title):
    if request.method == 'GET':
        if title:
            if util.get_entry(title):
                page_data = util.get_entry(title)
                return render(request, 'encyclopedia/edit.html', {"title": title, "page_data": page_data})
    elif request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        util.save_entry(title, content)
        return wiki(request, title)


def random_page(request):
    avail = util.list_entries()
    random_pg = random.choice(avail)
    return wiki(request, random_pg)
