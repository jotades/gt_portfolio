(function(){
  // RehaBalloon, "Teaching it to count": every squeeze recorded to train the model, from the project repository
  // (github.com/jasonhof/RehaBalloon, tflite-pressure/pumps.csv and quick_pumps.csv): 79 normal and 35 quick,
  // 119 samples each, in hPa above the starting pressure. Stored as one byte per sample: (hPa + 1) × 10, in base64.
  var fig = document.getElementById("sq"); if (!fig) return;
  var T = function(s){ return window.i18n ? window.i18n.t(s) : s; };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DATA = {
    normal: "WlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWnp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6iIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiHJycnJycnJycnJycnJycnJ/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3+cnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJySkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpJsbGxsbGxsbGxsbGxsbGxsbGxsbHV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXWampqampqampqampqampqampqampqampqampqampqampqamqWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWWlpaWlpaWlpaWlpaWlpaWaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaZaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaurq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq+vr6+vr6+vr6+vr6+vr69tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0mJiYmJiYmJiYmJiYmJiYmJoSEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLShoaGhoaGhoaGhoaGhoaGhoaGhfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+qampqampqampqampqampqampqampqampqampqampqamptra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2t7e3t7e3t7e3t7e3t7e3t7e3t7eKioqKioqKioqKioqKioqKioqKioqKioqKioqKWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OSwsLCwsLCwsLCwsLCwsLCwsLCwsLGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGR/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/lpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpalpaWlpaWlpaWlpaWlpaWljY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY1iYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEyMjIyMjIyMjIyMjIyMjIyMjJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJienp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enqPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PmJiYmJiYmJiYmJiYmJiYmHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVPTw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDAwMDAwMDAwMDAwMDAwMDAwbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbX9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3+Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Xl5eXl5eXl5eXl5eXl5eXl5eAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXD4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4wMDAwMDAwMDAwMDAwMDAwMDAwMFdXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWZmZmZmZmZmZmZmZmZmZmZnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJyciIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIhkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZENDQ0NDQ0NDQ0NDQ0NDQ0NkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWnp6enp6enp6enp6enp6enp7CwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzWFhYWFhYWFhYWFhYWFhYWFhYbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5uboyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyio6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo7KysrKysrKysrKysrKysrKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjG9vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29XV1dXV1dXV1dXV1dXV1dXV1ZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2trhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoagoKCgoKCgoKCgoKCgoKCgxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsKoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiofn5+fn5+fn5+fn5+fn5+fn5qampqampqampqampqampqampqampqampqampqampqampqg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg52dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dt7e3t7e3t7e3t7e3t7e3t9nZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dna2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NS9vb29vb29vb29vb29vb29vb29bm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5uUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDRwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcI6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq7Hx8fHx8fHx8fHx8fHx8fHx8fHx+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAk5OTk5OTk5OTk5OTk5OTk5OTk5OTVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVnp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enqUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUsbGxsbGxsbGxsbGxsbGxsbHMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcWtra2tra2tra2tra2tra2tra2tra2trWtra2tra2tra2tra2tra2tra2tra2tra1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV0ZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRj09PT09PT09PT09PT09PT09PT09PT09PT09PT09cHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcIuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4ugoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoLKysrKysrKysrKysrKysrK/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+zs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVaGhoaGhoaGhoaGhoaGhoaHFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXGMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKS2tra2tra2tra2tra2tra2v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7S0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjWRkZGRkZGRkZGRkZGRkZGRpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWmPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj6SkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpLOzs7Ozs7Ozs7Ozs7Ozs7Ozs8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp+fn5+fn5+fn5+fn5+fn5+fn5+fn5+c3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc46Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6oqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy8vLy8vLy8vLy8vLy8vLy8vLzX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExKGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhe3t7e3t7e3t7e3t7e3t7e3t7e3t7e3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3OXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCSkpKSkpKSkpKSkpKSkpKSXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09NjY2NjY2NjY2NjY2NjY2NjZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhJ6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6eq6urq6urq6urq6urq6urq5KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkmhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSjk5OTk5OTk5OTk5OTk5OTk5bW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn6Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PoaGhoaGhoaGhoaGhoaGhoaGysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKmpqampqampqampqampqampqampqampqampqampqampqamhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIRZWVlZWVlZWVlZWVlZWVlZWWJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJ7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7lZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWlpaWlpaWlpaWlpaWlpaWlqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYlkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkSEhISEhISEhISEhISEhISEhWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dIeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHlpaWlpaWlpaWlpaWlpaWlsTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExL29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29pqampqampqampqampqampqampqampqampqampqampqampnR0dHR0dHR0dHR0dHR0dHR0ZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+foqKioqKioqKioqKioqKioqenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp54eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4Tk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTjo6Ojo6Ojo6Ojo6Ojo6Ojo6OmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmKMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjKGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhnZ2dnZ2dnZ2dnZ2dnZ2dWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVl+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fpqampqampqampqampqampqampqampqampqampqampqampqvr6+vr6+vr6+vr6+vr6+vr6+6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6qampqampqampqampqampqampqampqampqampqampqampqamIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiGlpaWlpaWlpaWlpaWlpaWlpaVtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1t5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eZiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJipqampqampqampqampqampoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4Nra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra1hYWFhYWFhYWFhYWFhYWFhWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWe3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlaCgoKCgoKCgoKCgoKCgoKCgoKmpqampqampqampqampqampqampqampqampqampqaKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiooaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVmxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxshISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhJmZmZmZmZmZmZmZmZmZmZmpqampqampqampqampqampqampqampqampqampqampqampkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkGtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tPT09PT09PT09PT09PT09PT3V1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dY6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojp2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnaampqampqampqampqampqampqampaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWljIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU12dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2kZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWls7Ozs7Ozs7Ozs7Ozs7Ozs66urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6cnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHxcXFxcXFxcXFxcXFxcXFxcc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc42NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2kpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpLm5ubm5ubm5ubm5ubm5ubm7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u5SUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJRfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19GRkZGRkZGRkZGRkZGRkZGRkZGRmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2N+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn6ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmrq6urq6urq6urq6urq6urq6uruLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhWRkZGRkZGRkZGRkZGRkZGRkZGRkZGRXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6k5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OmpqampqampqampqampqampqamprKysrKysrKysrKysrKysrKysrKysrKysrKysrKgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKB+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fltbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5uboqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZ6enp6enp6enp6enp6enp6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo5ycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJyWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpNTU1NTU1NTU1NTU1NTU1NTXBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcIWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkaGhoaGhoaGhoaGhoaGhoaGhsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKypaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpYqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKZWVlZWVlZWVlZWVlZWVlZWVjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d4SEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEj4+Pj4+Pj4+Pj4+Pj4+Pj5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlBQUFBQUFBQUFBQUFBQUFBQWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWnR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHSJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiZSUlJSUlJSUlJSUlJSUlJSioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmHp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enpWVVVVVVVVVVVVVVVVVVVVVWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2OAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJeXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5ekpKSkpKSkpKSkpKSkpKSkqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJR2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dlpaWlpaWlpaWlpaWlpaWlo=",
    quick: "ZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGSVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2c2NjY2NjY2NjY2NjY2NjY2NjY2NjZZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlIGCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCglVVVVVVVVVVVVVVVVVVVVVVVX9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX181NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NSEhISEhISEhISEhISEhISEhaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaIaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZDIyMjIyMjIyMjIyMjIyMjJ7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7YmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYjg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4GhoaGhoaGhoaGhoaGhoaGnNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5ORsbGxsbGxsbGxsbGxsbGxsbfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fm1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW08PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PBwcHBwcHBwcHBwcHBwcHBxkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcEdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHHR0dHR0dHR0dHR0dHR0dHWxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxqampqampqampqampqampqampqampqampqampqampqampqakNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0MgICAgICAgICAgICAgICAgaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFgsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLBcXFxcXFxcXFxcXFxcXFxdmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2RkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYcHBwcHBwcHBwcHBwcHBwcHF5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5qampqampqampqampqampqampqampqampqampqampqampqODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OBkZGRkZGRkZGRkZGRkZGRkZd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT08jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIxISEhISEhISEhISEhISEhJ1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAGRkZGRkZGRkZGRkZGRkZGRkZGWtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2t5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5REREREREREREREREREREREREREREREREREREREREREREREQbGxsbGxsbGxsbGxsbGxsbfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OBgYGBgYGBgYGBgYGBgYGBiRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW01NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1GBgYGBgYGBgYGBgYGBgYGFpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWnBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHA7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7FxcXFxcXFxcXFxcXFxcXFxcXbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbFZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKRISEhISEhISEhISEhISEhKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKBAQEBAQEBAQEBAQEBAQEHNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2trazU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NRUVFRUVFRUVFRUVFRUVFRUVFRUVnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnXR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHQ2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2GRkZGRkZGRkZGRkZGRkZGRmQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHQ+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+GxsbGxsbGxsbGxsbGxsbG1xcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxqampqampqampqampqampqampqampqampqampqampqampqajw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8HBwcHBwcHBwcHBwcHBwcgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCglpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEODg4ODg4ODg4ODg4ODg5cXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWHR0dHR0dHR0dHR0dHR0dHY+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj49zc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjITExMTExMTExMTExMTExMTExMTampqampqampqampqampqampqampqampqampqampqampqZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmYrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrERERERERERERERERERERERFwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbWyUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDXR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHRWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIQ4ODg4ODg4ODg4ODg4ODg4OeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUCAgICAgICAgICAgICAgICAh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4TExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEwbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbCgoKCgoKCgoKCgoKCgoKCmhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGh1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUETExMTExMTExMTExMTExMTcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHg1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1DQ0NDQ0NDQ0NDQ0NDQ0NDQ1+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKShwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwKCgoKCgoKCgoKCgoKCgoKCg=="
  };
  var L = 119, TRIG = 7.5, KINDS = ["normal", "quick"], COLOR = { normal: "var(--c1)", quick: "var(--c2)" };
  var NAME = { normal: "Normal squeezes", quick: "Quick squeezes" };
  function decode(b){ var s = atob(b), out = [], w = []; for (var i = 0; i < s.length; i++) { w.push(s.charCodeAt(i) / 10 - 1); if (w.length === L) { out.push(w); w = []; } } return out; }
  var REC = { normal: decode(DATA.normal), quick: decode(DATA.quick) }, MEAN = {}, SD = {};
  KINDS.forEach(function(k){
    MEAN[k] = []; SD[k] = [];
    for (var i = 0; i < L; i++) {
      var m = 0, v = 0; REC[k].forEach(function(r){ m += r[i]; }); m /= REC[k].length;
      REC[k].forEach(function(r){ v += (r[i] - m) * (r[i] - m); });
      MEAN[k].push(m); SD[k].push(Math.sqrt(v / (REC[k].length - 1)));
    }
  });
  // where the average quick squeeze falls back below the trigger
  var drop = 0; while (drop < L && MEAN.quick[drop] >= TRIG) drop++;

  // the chart is drawn at its real width, so its text stays the same size on a phone; it redraws when that changes
  var svg = fig.querySelector(".sq-plot svg"), tip = fig.querySelector(".sq-tip"), cap = fig.querySelector(".sq-now");
  var NS = "http://www.w3.org/2000/svg", W = 640, H = 300, ml = 40, mr = 74, mt = 14, mb = 36, YMAX = 22;
  var x = function(i){ return ml + i / (L - 1) * (W - ml - mr); }, y = function(v){ return mt + (1 - Math.max(0, v) / YMAX) * (H - mt - mb); };
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; }
  function line(arr){ return arr.map(function(v, i){ return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(""); }
  function band(m, s){ var up = m.map(function(v, i){ return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v + s[i]).toFixed(1); }).join(""); var dn = ""; for (var i = L - 1; i >= 0; i--) dn += "L" + x(i).toFixed(1) + " " + y(m[i] - s[i]).toFixed(1); return up + dn + "Z"; }
  function fmt(v){ return T(v.toFixed(1) + " hPa"); }
  var IT = !!(window.i18n && window.i18n.lang === "it");
  function num(v){ var t = v.toFixed(1); return IT ? t.replace(".", ",") : t; }
  var g, paths, dots, cl, playP, drawnW = 0, played = null;
  function draw(){
    var w = Math.round(svg.parentNode.clientWidth); if (!w || w === drawnW) return;
    drawnW = w; W = Math.max(300, w); H = W < 520 ? 320 : Math.round(Math.min(460, Math.max(380, W * 0.62))); mr = W < 520 ? 58 : 78;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    g = { grid: el("g", {}, svg), raw: el("g", { class: "sq-raw" }, svg), band: el("g", {}, svg), mean: el("g", {}, svg), play: el("g", {}, svg), ann: el("g", { class: "sq-ann" }, svg), cross: el("g", { class: "sq-cross" }, svg) };
    [0, 5, 10, 15, 20].forEach(function(v){
      el("line", { class: "gridline", x1: ml, x2: W - mr, y1: y(v), y2: y(v) }, g.grid);
      el("text", { x: ml - 8, y: y(v) + 4, "text-anchor": "end" }, g.grid).textContent = v;
    });
    [0, 30, 60, 90, 118].forEach(function(i){ el("text", { x: x(i), y: H - mb + 18, "text-anchor": i === 0 ? "start" : i === 118 ? "end" : "middle" }, g.grid).textContent = i; });
    el("text", { x: (ml + W - mr) / 2, y: H - 4, "text-anchor": "middle" }, g.grid).textContent = T("samples after the trigger");
    el("text", { x: ml, y: mt - 2, class: "sq-unit" }, g.grid).textContent = "hPa";
    el("line", { class: "sq-trig", x1: ml, x2: W - mr, y1: y(TRIG), y2: y(TRIG) }, g.grid);
    el("text", { class: "sq-trig-t", x: W - mr + 6, y: y(TRIG) + 4 }, g.grid).textContent = T("trigger");
    paths = {};
    KINDS.forEach(function(k){
      var rg = el("g", { "data-k": k }, g.raw);
      REC[k].forEach(function(r){ el("path", { d: line(r), stroke: COLOR[k] }, rg); });
      paths[k] = {
        raw: rg,
        band: el("path", { class: "sq-band", d: band(MEAN[k], SD[k]), fill: COLOR[k] }, g.band),
        mean: el("path", { class: "sq-mean", d: line(MEAN[k]), stroke: COLOR[k] }, g.mean),
        label: el("text", { class: "sq-lab", x: W - mr + 6, y: y(MEAN[k][L - 1]) + 4 }, g.mean)
      };
      paths[k].label.textContent = T(k === "normal" ? "Normal" : "Quick");
    });
    // the moment the quick squeezes let go; the note sits in the empty space to its left
    var ax = x(drop), ay = y(MEAN.quick[drop]);
    el("circle", { cx: ax, cy: ay, r: 4.5, class: "sq-dot" }, g.ann);
    var at = el("text", { x: ax - 10, y: y(4.6), "text-anchor": "end" }, g.ann);
    el("tspan", { x: ax - 10, "font-weight": "700" }, at).textContent = T("Quick squeezes let go");
    el("tspan", { x: ax - 10, dy: "1.25em" }, at).textContent = T((W < 520 ? "from sample " : "below the trigger from sample ") + drop);
    el("line", { x1: ax - 6, y1: y(4.6) - 4, x2: ax - 3, y2: ay + 3, class: "sq-lead" }, g.ann);
    cl = el("line", { y1: mt, y2: H - mb }, g.cross); dots = {};
    KINDS.forEach(function(k){ dots[k] = el("circle", { r: 4, fill: COLOR[k] }, g.cross); });
    el("rect", { x: ml, y: mt, width: W - ml - mr, height: H - mt - mb, fill: "transparent", class: "sq-hit" }, svg);
    playP = el("path", { class: "sq-playline" }, g.play);
    if (played) { playP.setAttribute("stroke", COLOR[played[0]]); playP.setAttribute("d", line(played[1])); }
    if (typeof apply === "function" && paths) apply();
  }

  // what is shown
  var show = "both";
  function on(k){ return show === "both" || show === k; }
  function apply(){
    if (!paths) return;   // not drawn yet: the page is hidden until it is first shown
    KINDS.forEach(function(k){ var v = on(k); paths[k].raw.style.display = v && fig.querySelector(".sq-all").checked ? "" : "none"; paths[k].band.style.display = paths[k].mean.style.display = paths[k].label.style.display = v ? "" : "none"; });
    g.ann.style.display = on("quick") ? "" : "none";
    fig.querySelectorAll("[data-show]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-show") === show)); });
    if (cur >= 0) point(cur);
  }
  fig.querySelectorAll("[data-show]").forEach(function(b){ b.addEventListener("click", function(){ show = b.getAttribute("data-show"); apply(); }); });
  fig.querySelector(".sq-all").addEventListener("change", apply);

  // the crosshair: it snaps to the nearest sample and reads every series shown there
  var cur = -1;
  function point(i){
    cur = i; g.cross.style.display = "";
    cl.setAttribute("x1", x(i)); cl.setAttribute("x2", x(i));
    tip.textContent = "";
    var h = document.createElement("div"); h.className = "sq-tip-h"; h.textContent = T("Sample " + i); tip.appendChild(h);
    KINDS.forEach(function(k){
      dots[k].style.display = on(k) ? "" : "none";
      dots[k].setAttribute("cx", x(i)); dots[k].setAttribute("cy", y(MEAN[k][i]));
      if (!on(k)) return;
      var r = document.createElement("div"); r.className = "sq-tip-r";
      var key = document.createElement("span"); key.className = "sq-key"; key.style.background = COLOR[k];
      var b = document.createElement("b"); b.textContent = fmt(MEAN[k][i]);
      var s = document.createElement("span"); s.textContent = T(k === "normal" ? "normal, average" : "quick, average") + " ± " + num(SD[k][i]);
      r.appendChild(key); r.appendChild(b); r.appendChild(s); tip.appendChild(r);
    });
    tip.hidden = false;
    var box = svg.getBoundingClientRect(), px = x(i) / W * box.width;
    tip.style.left = Math.min(Math.max(px + 12, 0), box.width - tip.offsetWidth - 4) + "px";
    if (px + 12 + tip.offsetWidth > box.width) tip.style.left = Math.max(0, px - tip.offsetWidth - 12) + "px";
  }
  function hide(){ cur = -1; if (g) g.cross.style.display = "none"; tip.hidden = true; }
  svg.addEventListener("pointermove", function(e){
    var box = svg.getBoundingClientRect(), vx = (e.clientX - box.left) / box.width * W;
    if (vx < ml - 10 || vx > W - mr + 10) { hide(); return; }
    point(Math.max(0, Math.min(L - 1, Math.round((vx - ml) / (W - ml - mr) * (L - 1)))));
  });
  svg.addEventListener("pointerleave", hide);
  svg.addEventListener("keydown", function(e){
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault(); point(Math.max(0, Math.min(L - 1, (cur < 0 ? 0 : cur) + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1))));
  });
  svg.addEventListener("focus", function(){ if (cur < 0) point(0); });
  svg.addEventListener("blur", hide);

  // play one recording, drawn as the board captured it
  var timer = 0;
  fig.querySelector(".sq-play").addEventListener("click", function(){
    var pool = []; KINDS.forEach(function(k){ if (on(k)) REC[k].forEach(function(r, j){ pool.push([k, j, r]); }); });
    var p = pool[Math.floor(Math.random() * pool.length)], k = p[0], r = p[2], n = 0;
    played = [k, r];
    playP.setAttribute("stroke", COLOR[k]);
    cap.textContent = T(k === "normal" ? "Normal squeeze" : "Quick squeeze") + " " + (p[1] + 1) + " / " + REC[k].length;
    clearInterval(timer);
    if (reduce) { playP.setAttribute("d", line(r)); return; }
    timer = setInterval(function(){ n += 3; playP.setAttribute("d", line(r.slice(0, Math.min(n, L)))); if (n >= L) clearInterval(timer); }, 16);
  });

  // the same numbers as a table: averages and spread every ten samples
  var tb = fig.querySelector(".sq-table tbody"), rows = "";
  for (var i = 0; i < L; i += 10) rows += "<tr><td>" + i + "</td><td>" + num(MEAN.normal[i]) + " ± " + num(SD.normal[i]) + "</td><td>" + num(MEAN.quick[i]) + " ± " + num(SD.quick[i]) + "</td></tr>";
  tb.innerHTML = rows;
  draw(); apply(); hide();
  if ("ResizeObserver" in window) new ResizeObserver(function(){ var c = cur; draw(); hide(); if (c >= 0) point(c); }).observe(svg.parentNode);
  else window.addEventListener("resize", function(){ draw(); hide(); });
})();
