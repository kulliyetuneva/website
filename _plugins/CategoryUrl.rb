module Jekyll
    module CategoryUrl
        def make_category_url(input)
            baseurl = @context.registers[:site].baseurl
            slugified = Utils.slugify(input.gsub("'", ""), mode: "latin")
            "#{baseurl}/category/#{slugified}"
        end
    end
end

Liquid::Template.register_filter(Jekyll::CategoryUrl)