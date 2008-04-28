# Usage: ruby setup.rb
# Joins stutools, compresses and creates ../../stu.js and ../../moo.js

require 'ftools'

def expand(path)
  File.expand_path path, File.expand_path(File.dirname(__FILE__))
end

stu = expand '../../stu.js'
moo = expand '../../moo.js'

File.open(stu, 'w+') { |f| f << Dir[expand('../') + '/*.js'].collect { |js| File.open(js).collect.join }.join("\n") }
File.copy expand('moo.js'), moo

system "java -jar #{expand 'yui_compressor.jar'} -o #{stu} #{stu}"
system "java -jar #{expand 'yui_compressor.jar'} -o #{moo} #{moo}"